import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig } from './config.js';
import {
  searchOrganic,
  searchScrape,
  getFields,
  getCount
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 60);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('archive')
  .description(chalk.bold('Internet Archive CLI') + ' - Search the Internet Archive from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--base-url <url>', 'API base URL')
  .action((options) => {
    if (options.baseUrl) {
      setConfig('baseUrl', options.baseUrl);
      printSuccess('Base URL set');
    } else {
      printError('No options provided. Use --base-url');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const baseUrl = getConfig('baseUrl');
    console.log(chalk.bold('\nInternet Archive CLI Configuration\n'));
    console.log('Base URL: ', chalk.green(baseUrl || 'https://archive.org/services'));
    console.log('');
  });

// ============================================================
// SEARCH
// ============================================================

program
  .command('search <query>')
  .description('Search the Internet Archive')
  .option('--fields <list>', 'Comma-separated metadata fields to return')
  .option('--size <num>', 'Number of results (default: 50)', '50')
  .option('--sort <field>', 'Sort by field (e.g., downloads desc)')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const searchOptions = {
        size: parseInt(options.size) || 50
      };

      if (options.fields) {
        searchOptions.fields = options.fields;
      }

      if (options.sort) {
        searchOptions.sort = options.sort;
      }

      const data = await withSpinner(`Searching for "${query}"...`, () =>
        searchOrganic(query, searchOptions)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold(`\nSearch Results — "${chalk.cyan(query)}"\n`));

      if (data.numFound !== undefined) {
        console.log(chalk.dim(`Total found: ${data.numFound.toLocaleString()}`));
        console.log('');
      }

      const items = data.response?.docs || data.items || [];
      if (items.length === 0) {
        console.log(chalk.yellow('No results found.'));
        return;
      }

      const tableData = items.map(item => ({
        identifier: item.identifier || item.id || 'N/A',
        title: (item.title || 'Untitled').substring(0, 50),
        type: item.mediatype || item.type || 'unknown',
        date: item.date || item.publicdate || 'N/A'
      }));

      printTable(tableData, [
        { key: 'identifier', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'date', label: 'Date' }
      ]);

      console.log(chalk.dim('\nView item: https://archive.org/details/<identifier>'));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// SCRAPE
// ============================================================

program
  .command('scrape <query>')
  .description('Scrape results with cursor pagination')
  .option('--fields <list>', 'Comma-separated metadata fields')
  .option('--size <num>', 'Results per page (default: 100)', '100')
  .option('--cursor <cursor>', 'Pagination cursor')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const searchOptions = {
        size: parseInt(options.size) || 100
      };

      if (options.fields) {
        searchOptions.fields = options.fields;
      }

      if (options.cursor) {
        searchOptions.cursor = options.cursor;
      }

      const data = await withSpinner(`Scraping "${query}"...`, () =>
        searchScrape(query, searchOptions)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold(`\nScrape Results — "${chalk.cyan(query)}"\n`));

      if (data.total !== undefined) {
        console.log(chalk.dim(`Total: ${data.total.toLocaleString()}`));
      }

      if (data.cursor) {
        console.log(chalk.dim(`Next cursor: ${data.cursor}`));
      }

      console.log('');

      const items = data.items || [];
      const tableData = items.map(item => ({
        identifier: item.identifier || 'N/A',
        title: (item.title || 'Untitled').substring(0, 50)
      }));

      printTable(tableData, [
        { key: 'identifier', label: 'Identifier' },
        { key: 'title', label: 'Title' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// COUNT
// ============================================================

program
  .command('count <query>')
  .description('Get total count for a search query')
  .option('--json', 'Output as JSON')
  .action(async (query, options) => {
    try {
      const data = await withSpinner(`Counting results for "${query}"...`, () =>
        getCount(query)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nSearch Count\n'));
      console.log(`Query:  ${chalk.cyan(query)}`);
      console.log(`Total:  ${chalk.green((data.total || 0).toLocaleString())}`);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// FIELDS
// ============================================================

program
  .command('fields')
  .description('List available metadata fields')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const data = await withSpinner('Fetching available fields...', () => getFields());

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nAvailable Metadata Fields\n'));

      const fields = Array.isArray(data) ? data : (data.fields || []);

      if (fields.length === 0) {
        console.log(chalk.yellow('No fields found.'));
        return;
      }

      fields.forEach(field => {
        console.log(`  ${chalk.cyan('•')} ${field}`);
      });

      console.log(chalk.dim(`\n${fields.length} field(s) available`));
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
