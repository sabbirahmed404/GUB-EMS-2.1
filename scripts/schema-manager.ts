import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
export interface TableColumn {
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  description: string | null;
}

export interface TableColumns {
  [column_name: string]: TableColumn;
}

export interface TableConstraints {
  [constraint_name: string]: {
    constraint_type: string;
    definition: string;
  };
}

export interface TableForeignKeys {
  [constraint_name: string]: {
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
  };
}

export interface TableIndexes {
  [index_name: string]: {
    indexdef: string;
  };
}

export interface TableTriggers {
  [trigger_name: string]: {
    action_timing: string;
    event_manipulation: string;
    action_statement: string;
  };
}

export interface TablePolicies {
  [policy_name: string]: {
    command: string;
    permissive: string;
    roles: string[] | null;
    qual: string | null;
    with_check: string | null;
  };
}

export interface TableInfo {
  table_name: string;
  columns: TableColumns;
  constraints: TableConstraints;
  foreign_keys: TableForeignKeys;
  indexes: TableIndexes;
  triggers: TableTriggers;
  policies: TablePolicies;
}

export interface ViewColumn {
  data_type: string;
  description: string | null;
}

export interface ViewColumns {
  [column_name: string]: ViewColumn;
}

export interface ViewInfo {
  view_name: string;
  definition: string;
  columns: ViewColumns;
}

export interface ForeignKey {
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_name: string;
}

export interface TableConstraint {
  constraint_name: string;
  constraint_type: string;
  column_names: string[] | null;
  definition: string;
}

export interface TableIndex {
  indexname: string;
  indexdef: string;
}

export interface TableTrigger {
  trigger_name: string;
  action_timing: string;
  event_manipulation: string;
  action_statement: string;
  function_definition: string;
}

export interface TablePolicy {
  policyname: string;
  command: string;
  permissive: string;
  roles: string[] | null;
  using: string | null;
  with_check: string | null;
}

export interface DatabaseFunction {
  function_name: string;
  language: string;
  return_type: string;
  argument_types: string;
  definition: string;
  description: string | null;
}

export interface SchemaInfo {
  tables: TableInfo[] | null;
  views: ViewInfo[] | null;
  functions: DatabaseFunction[] | null;
}

// Helper functions
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getLatestVersionNumber(dirPath: string, baseFileName: string): number {
  try {
    const files = fs.readdirSync(dirPath);
    const versionRegex = new RegExp(`${baseFileName}_(\\d+)\\.sql$`);
    
    let maxVersion = 0;
    files.forEach(file => {
      const match = file.match(versionRegex);
      if (match) {
        const version = parseInt(match[1]);
        maxVersion = Math.max(maxVersion, version);
      }
    });
    
    return maxVersion;
  } catch (error) {
    console.warn('Error reading directory for versioning:', error);
    return 0;
  }
}

function writeFile(filePath: string, content: string) {
  const isJson = path.extname(filePath) === '.json';
  const isSql = path.extname(filePath) === '.sql';
  const timestamp = new Date().toISOString();
  
  let finalPath = filePath;
  let documentContent = content;

  // Handle SQL file versioning
  if (isSql) {
    const dirPath = path.dirname(filePath);
    const baseFileName = path.basename(filePath, '.sql');
    const nextVersion = getLatestVersionNumber(dirPath, baseFileName) + 1;
    finalPath = path.join(dirPath, `${baseFileName}_${nextVersion}.sql`);
    documentContent = `-- Generated on: ${timestamp}\n-- Version: ${nextVersion}\n\n${content}`;
  } else if (isJson) {
    // For JSON files, include timestamp in the content
    documentContent = JSON.stringify({ generated_at: timestamp, ...JSON.parse(content) }, null, 2);
  } else {
    // For other files (like markdown), just add timestamp at the top
    documentContent = `<!-- Generated on: ${timestamp} -->\n\n${content}`;
  }

  fs.writeFileSync(finalPath, documentContent, 'utf8');
  
  const stats = fs.statSync(finalPath);
  const sizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`✓ ${path.basename(finalPath)} written (${sizeInKB} KB)`);
  console.log(`  - Last modified: ${stats.mtime}`);
  console.log(`  - Path: ${finalPath}\n`);
}

// Core functions
async function fetchDatabaseInfo(objectName?: string): Promise<SchemaInfo> {
  try {
    console.log('Connecting to Supabase...');
    
    const { data, error } = await supabase.rpc('get_schema_info');
    
    if (error) {
      console.error('Error executing schema query:', error);
      throw error;
    }

    if (!data) {
      console.warn('No data returned from get_schema_info');
      return { tables: [], views: [], functions: [] };
    }

    if (objectName) {
      return {
        tables: data.tables?.filter(t => t.table_name === objectName) || [],
        views: data.views?.filter(v => v.view_name === objectName) || [],
        functions: data.functions || []
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching database info:', error);
    throw error;
  }
}

function generateMarkdown(schemaInfo: SchemaInfo): string {
  let markdown = '# Database Schema Documentation\n\n';
  
  // Overview
  markdown += '## Overview\n\n';
  markdown += `- Total Tables: ${schemaInfo.tables?.length || 0}\n`;
  markdown += `- Total Views: ${schemaInfo.views?.length || 0}\n`;
  markdown += `- Total Functions: ${schemaInfo.functions?.length || 0}\n\n`;
  
  // Tables
  markdown += '## Tables\n\n';
  (schemaInfo.tables || []).forEach(table => {
    markdown += `### ${table.table_name}\n\n`;

    // Columns
    markdown += '#### Columns\n\n';
    markdown += '| Name | Type | Nullable | Default | Description |\n';
    markdown += '|------|------|----------|----------|-------------|\n';
    Object.entries(table.columns || {}).forEach(([name, col]) => {
      markdown += `| ${name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'NULL'} | ${col.description || '-'} |\n`;
    });
    markdown += '\n';
  });

  // Views
  markdown += '## Views\n\n';
  (schemaInfo.views || []).forEach(view => {
    markdown += `### ${view.view_name}\n\n`;
    markdown += '#### Definition\n\n```sql\n' + view.definition + '\n```\n\n';
    
    if (view.columns) {
      markdown += '#### Columns\n\n';
      markdown += '| Name | Type | Description |\n';
      markdown += '|------|------|-------------|\n';
      Object.entries(view.columns).forEach(([name, col]) => {
        markdown += `| ${name} | ${col.data_type} | ${col.description || '-'} |\n`;
      });
      markdown += '\n';
    }
  });

  // Functions
  markdown += '## Functions\n\n';
  (schemaInfo.functions || []).forEach(func => {
    markdown += `### ${func.function_name}\n\n`;
    markdown += `- Language: ${func.language}\n`;
    markdown += `- Returns: ${func.return_type}\n`;
    markdown += `- Arguments: ${func.argument_types}\n`;
    if (func.description) {
      markdown += `- Description: ${func.description}\n`;
    }
    markdown += '\n```sql\n' + func.definition + '\n```\n\n';
  });

  return markdown;
}

function generateSQL(schemaInfo: SchemaInfo): string {
  let sql = '-- Database Schema\n\n';

  // Functions
  sql += '-- Functions\n';
  (schemaInfo.functions || []).forEach(func => {
    sql += `-- Function: ${func.function_name}\n`;
    sql += func.definition + '\n\n';
  });

  // Tables
  (schemaInfo.tables || []).forEach(table => {
    sql += `-- Table: ${table.table_name}\n`;
    // Add table definition...
  });

  // Views
  sql += '\n-- Views\n';
  (schemaInfo.views || []).forEach(view => {
    sql += `-- View: ${view.view_name}\n`;
    sql += view.definition + '\n\n';
  });

  return sql;
}

// Add new function for TMS documentation
function generateTMSDocumentation(schemaInfo: SchemaInfo): string {
  let markdown = '# Team Management System (TMS) Quick Reference\n\n';
  
  // Overview
  markdown += '## Overview\n\n';
  const tmsTableNames = ['teams', 'team_members', 'team_tasks', 'team_join_requests', 'team_activity_log', 'users', 'events'];
  const tmsTables = schemaInfo.tables?.filter(t => tmsTableNames.includes(t.table_name)) || [];
  
  markdown += '### Core Tables\n';
  tmsTableNames.forEach(tableName => {
    const table = tmsTables.find(t => t.table_name === tableName);
    if (table) {
      const columnCount = Object.keys(table.columns || {}).length;
      const constraintCount = Object.keys(table.constraints || {}).length;
      const triggerCount = Object.keys(table.triggers || {}).length;
      markdown += `- **${tableName}**: ${columnCount} columns, ${constraintCount} constraints, ${triggerCount} triggers\n`;
    }
  });
  markdown += '\n';

  // Table Details
  markdown += '## Table Details\n\n';
  tmsTables.forEach(table => {
    markdown += `### ${table.table_name}\n\n`;
    
    // Key Columns
    markdown += '#### Key Columns\n';
    Object.entries(table.columns || {}).forEach(([name, col]) => {
      if (name.includes('id') || name.includes('status') || name.includes('role')) {
        markdown += `- **${name}**: ${col.data_type}${col.is_nullable === 'NO' ? ' (required)' : ''}\n`;
        if (col.description) markdown += `  - ${col.description}\n`;
      }
    });
    markdown += '\n';
  });

  // RLS Policies
  markdown += '## Row Level Security (RLS) Policies\n\n';
  markdown += '> These policies control row-level access to tables\n\n';
  tmsTables.forEach(table => {
    if (Object.keys(table.policies).length > 0) {
      markdown += `### ${table.table_name}\n`;
      Object.entries(table.policies).forEach(([name, policy]) => {
        markdown += `- **${name}**: ${policy.command} (${policy.permissive})\n`;
        if (policy.roles) markdown += `  - Roles: ${policy.roles.join(', ')}\n`;
        if (policy.qual) markdown += `  - Using: ${policy.qual}\n`;
      });
      markdown += '\n';
    }
  });

  // Triggers
  markdown += '## Triggers\n\n';
  markdown += '> Triggers automatically maintain data integrity and handle events\n\n';
  tmsTables.forEach(table => {
    if (Object.keys(table.triggers).length > 0) {
      markdown += `### ${table.table_name}\n`;
      Object.entries(table.triggers).forEach(([name, trigger]) => {
        markdown += `- **${name}**\n`;
        markdown += `  - Timing: ${trigger.action_timing} ${trigger.event_manipulation}\n`;
        markdown += `  - Action: ${trigger.action_statement.split('\n')[0]}...\n`;
      });
      markdown += '\n';
    }
  });

  // Functions
  markdown += '## Key Functions\n\n';
  markdown += '> These functions implement core business logic\n\n';
  const tmsFunctions = schemaInfo.functions?.filter(f => 
    f.function_name.includes('team') || 
    f.function_name.includes('user') || 
    f.function_name.includes('event')
  ) || [];

  // Group functions by category
  const functionCategories = {
    team: tmsFunctions.filter(f => f.function_name.includes('team')),
    user: tmsFunctions.filter(f => f.function_name.includes('user')),
    event: tmsFunctions.filter(f => f.function_name.includes('event'))
  };

  Object.entries(functionCategories).forEach(([category, functions]) => {
    if (functions.length > 0) {
      markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Functions\n`;
      functions.forEach(func => {
        markdown += `- **${func.function_name}**\n`;
        markdown += `  - Returns: ${func.return_type}\n`;
        markdown += `  - Arguments: ${func.argument_types}\n`;
        if (func.description) markdown += `  - Description: ${func.description}\n`;
      });
      markdown += '\n';
    }
  });

  // Constraints
  markdown += '## Table Constraints\n\n';
  markdown += '> These constraints ensure data integrity\n\n';
  tmsTables.forEach(table => {
    if (Object.keys(table.constraints).length > 0) {
      markdown += `### ${table.table_name}\n`;
      Object.entries(table.constraints).forEach(([name, constraint]) => {
        markdown += `- **${name}**: ${constraint.constraint_type}\n`;
        markdown += `  - ${constraint.definition}\n`;
      });
      markdown += '\n';
    }
  });

  // Foreign Key Dependencies
  markdown += '## Foreign Key Dependencies\n\n';
  markdown += '> These relationships show how tables are connected\n\n';
  tmsTables.forEach(table => {
    if (Object.keys(table.foreign_keys).length > 0) {
      markdown += `### ${table.table_name}\n`;
      Object.entries(table.foreign_keys).forEach(([name, fk]) => {
        markdown += `- **${fk.column_name}** → ${fk.foreign_table_name}(${fk.foreign_column_name})\n`;
      });
      markdown += '\n';
    }
  });

  // Quick Tips
  markdown += '## Quick Tips\n\n';
  markdown += '- All tables have RLS policies - make sure to use correct auth context\n';
  markdown += '- Team operations should check permissions using `check_team_permission` function\n';
  markdown += '- Event operations should verify ownership or team membership\n';
  markdown += '- Use provided functions instead of direct table operations when possible\n';
  markdown += '- Check `team_activity_log` for audit trail of all team operations\n';

  return markdown;
}

// Main command handler
async function handleCommand(command: string, objectName?: string) {
  try {
    const rootDir = path.resolve(__dirname, '..');
    const baseDocsDir = path.join(rootDir, 'Documentations', 'schema');
    
    let targetDir = baseDocsDir;
    if (objectName) {
      targetDir = path.join(baseDocsDir, objectName);
    } else if (command === 'fetch-docs') {
      targetDir = path.join(baseDocsDir, 'schema_others');
    } else if (command === 'fetch-tms') {
      targetDir = path.join(baseDocsDir, 'TMS');
    }
    
    ensureDirectoryExists(targetDir);

    switch (command) {
      case 'fetch-schema': {
        const schemaInfo = await fetchDatabaseInfo(objectName);
        
        console.log('\nSchema Information:');
        console.log(`- Total Tables: ${schemaInfo.tables?.length || 0}`);
        console.log(`- Total Views: ${schemaInfo.views?.length || 0}`);
        console.log(`- Total Functions: ${schemaInfo.functions?.length || 0}`);
        console.log('- Tables:', schemaInfo.tables?.map(t => t.table_name).join(', '));
        console.log('- Views:', schemaInfo.views?.map(v => v.view_name).join(', '), '\n');
        
        writeFile(
          path.join(targetDir, 'schema_info.json'),
          JSON.stringify(schemaInfo, null, 2)
        );
        
        writeFile(
          path.join(targetDir, 'schema_docs.md'),
          generateMarkdown(schemaInfo)
        );
        
        writeFile(
          path.join(targetDir, 'schema.sql'),
          generateSQL(schemaInfo)
        );
        
        console.log(`Schema files generated in ${targetDir}`);
        break;
      }
      
      case 'fetch-table': {
        if (!objectName) {
          throw new Error('Name is required for fetch-table command');
        }
        
        const schemaInfo = await fetchDatabaseInfo(objectName);
        if (!schemaInfo.tables?.length && !schemaInfo.views?.length) {
          throw new Error(`Table or view '${objectName}' not found`);
        }
        
        writeFile(
          path.join(targetDir, 'schema_info.json'),
          JSON.stringify(schemaInfo, null, 2)
        );
        
        writeFile(
          path.join(targetDir, 'schema_docs.md'),
          generateMarkdown(schemaInfo)
        );
        
        writeFile(
          path.join(targetDir, 'schema.sql'),
          generateSQL(schemaInfo)
        );
        
        console.log(`Schema files generated in ${targetDir}`);
        break;
      }
      
      case 'fetch-docs': {
        // Handle documentation generation
        const schemaInfo = await fetchDatabaseInfo();
        writeFile(
          path.join(targetDir, 'documentation.md'),
          generateMarkdown(schemaInfo)
        );
        console.log(`Documentation generated in ${targetDir}`);
        break;
      }
      
      case 'fetch-tms': {
        const schemaInfo = await fetchDatabaseInfo();
        
        writeFile(
          path.join(targetDir, 'tms_quick_reference.md'),
          generateTMSDocumentation(schemaInfo)
        );
        
        console.log(`TMS documentation generated in ${targetDir}`);
        break;
      }
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const objectName = args[1];

if (!command) {
  console.error('Please provide a command: fetch-schema, fetch-table [objectName], or fetch-docs');
  process.exit(1);
}

handleCommand(command, objectName); 