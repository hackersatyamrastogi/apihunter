// Database & Data Storage Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';
import { MongoClient } from 'mongodb';

// PostgreSQL Provider
export const postgresProvider: ProviderDefinition = {
  id: 'postgres',
  name: 'postgres',
  displayName: 'PostgreSQL',
  category: 'database',
  description: 'Validate PostgreSQL connection credentials and format',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: false, placeholder: 'postgresql://user:pass@host:5432/dbname' },
    { name: 'host', label: 'Host', type: 'text', required: false, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '5432' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
    { name: 'database', label: 'Database', type: 'text', required: false },
    { name: 'ssl', label: 'SSL Mode', type: 'text', required: false, placeholder: 'require/prefer/disable' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      let host = credentials.host || '';
      let port = credentials.port || '5432';
      let username = credentials.username || '';
      let password = credentials.password || '';
      let database = credentials.database || '';
      let ssl = credentials.ssl || '';

      // Parse connection string if provided
      if (credentials.connection_string) {
        const connStr = credentials.connection_string;

        if (!connStr.startsWith('postgresql://') && !connStr.startsWith('postgres://')) {
          return createValidationResult('error', undefined, 'Invalid PostgreSQL connection string format. Must start with postgresql:// or postgres://');
        }

        try {
          const url = new URL(connStr.replace('postgres://', 'postgresql://'));
          username = url.username || '';
          password = url.password || '';
          host = url.hostname || '';
          port = url.port || '5432';
          database = url.pathname.substring(1).split('?')[0] || '';

          const params = new URLSearchParams(url.search);
          ssl = params.get('sslmode') || params.get('ssl') || '';
        } catch (parseError) {
          return createValidationResult('error', undefined, 'Failed to parse PostgreSQL connection string');
        }
      }

      if (!host || !username || !password) {
        return createValidationResult('error', undefined, 'Missing required fields: host, username, and password are required');
      }

      // Format validation successful
      return createValidationResult('valid', {
        host,
        port,
        username,
        database: database || 'postgres',
        ssl: ssl || 'none',
        validationType: 'Format Validation',
        note: '✓ PostgreSQL connection string successfully parsed and validated',
      });
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// MongoDB Atlas Provider (using Data API)
export const mongodbProvider: ProviderDefinition = {
  id: 'mongodb',
  name: 'mongodb',
  displayName: 'MongoDB Atlas',
  category: 'database',
  description: 'Validate MongoDB Atlas API Key via Data API',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'Your MongoDB Atlas API key' },
    { name: 'group_id', label: 'Group/Project ID', type: 'text', required: true, placeholder: 'Project ID from Atlas' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      // Use MongoDB Atlas Admin API to verify credentials
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://cloud.mongodb.com/api/atlas/v1.0/groups/${credentials.group_id}`,
        headers: {
          'Accept': 'application/json',
        },
        auth: {
          username: credentials.api_key,
          password: '',
        },
      });

      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          groupName: response.data.name,
          groupId: response.data.id,
        }, undefined, undefined, response.status, duration);
      }

      return createValidationResult('invalid', undefined, 'Invalid MongoDB Atlas credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// MongoDB Database Credentials Provider
export const mongodbDatabaseProvider: ProviderDefinition = {
  id: 'mongodb-database',
  name: 'mongodb-database',
  displayName: 'MongoDB Database',
  category: 'database',
  description: 'Validate MongoDB database credentials using Data API',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: false, placeholder: 'mongodb+srv://user:pass@cluster.mongodb.net/db' },
    { name: 'cluster_name', label: 'Cluster Name', type: 'text', required: false, placeholder: 'cluster0' },
    { name: 'database', label: 'Database Name', type: 'text', required: false, placeholder: 'myDatabase' },
    { name: 'collection', label: 'Collection Name', type: 'text', required: false, placeholder: 'test', helperText: 'Collection to test access' },
    { name: 'data_api_key', label: 'Data API Key', type: 'password', required: false, placeholder: 'MongoDB Data API Key' },
    { name: 'data_api_url', label: 'Data API URL', type: 'text', required: false, placeholder: 'https://data.mongodb-api.com/app/...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      // Method 1: Using Data API if provided
      if (credentials.data_api_url && credentials.data_api_key) {
        const { response, duration } = await safeRequest({
          method: 'POST',
          url: `${credentials.data_api_url}/endpoint/data/v1/action/findOne`,
          headers: {
            'Content-Type': 'application/json',
            'api-key': credentials.data_api_key,
          },
          data: {
            dataSource: credentials.cluster_name || 'Cluster0',
            database: credentials.database || 'test',
            collection: credentials.collection || 'test',
            filter: { _id: { $exists: true } },
            limit: 1,
          },
        });

        if (isSuccessResponse(response.status)) {
          return createValidationResult('valid', {
            database: credentials.database,
            cluster: credentials.cluster_name,
            method: 'Data API',
          }, undefined, undefined, response.status, duration);
        }

        if (response.status === 401 || response.status === 403) {
          return createValidationResult('invalid', undefined, 'Invalid MongoDB Data API credentials', undefined, response.status, duration);
        }

        return createValidationResult('error', undefined, `Data API error: ${response.status}`, undefined, response.status, duration);
      }

      // Method 2: Test actual MongoDB connection
      if (credentials.connection_string) {
        const connectionString = credentials.connection_string;

        // Basic validation of connection string format
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
          return createValidationResult('error', undefined, 'Invalid MongoDB connection string format');
        }

        // Extract database name from connection string
        let database = '';
        try {
          const url = new URL(connectionString);
          const pathname = url.pathname;
          if (pathname && pathname.length > 1) {
            database = pathname.substring(1).split('?')[0];
          }
        } catch (parseError) {
          // Continue with connection test even if URL parsing fails
        }

        // Test actual MongoDB connection
        let client: MongoClient | null = null;
        try {
          client = new MongoClient(connectionString, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 5000,
          });

          await client.connect();

          // Try to ping the database
          const admin = client.db().admin();
          const pingResult = await admin.ping();

          const duration = Date.now() - startTime;

          // Get server info
          const serverInfo = await admin.serverInfo();

          await client.close();

          return createValidationResult('valid', {
            database: database || 'admin',
            mongoVersion: serverInfo.version,
            validationType: 'Live Connection Test',
            note: '✓ Successfully connected to MongoDB database',
          }, undefined, undefined, undefined, duration);

        } catch (connectionError: any) {
          if (client) {
            try {
              await client.close();
            } catch (closeError) {
              // Ignore close errors
            }
          }

          const duration = Date.now() - startTime;

          // Check for authentication errors
          if (connectionError.message?.includes('Authentication failed') ||
              connectionError.message?.includes('auth failed') ||
              connectionError.code === 18) {
            return createValidationResult('invalid', {
              error: 'Authentication failed',
              database: database || 'unknown',
            }, 'Invalid MongoDB credentials - authentication failed', undefined, undefined, duration);
          }

          // Check for network errors
          if (connectionError.message?.includes('ENOTFOUND') ||
              connectionError.message?.includes('ETIMEDOUT') ||
              connectionError.message?.includes('ECONNREFUSED')) {
            return createValidationResult('error', {
              error: 'Network error',
              database: database || 'unknown',
            }, `Cannot reach MongoDB server: ${connectionError.message}`, undefined, undefined, duration);
          }

          // Other connection errors
          return createValidationResult('error', {
            database: database || 'unknown',
          }, `Connection test failed: ${connectionError.message}`, undefined, undefined, duration);
        }
      }

      return createValidationResult('error', undefined, 'Please provide either a connection string or Data API credentials');
    } catch (error) {
      const duration = Date.now() - startTime;
      return createValidationResult('error', undefined, sanitizeError(error), undefined, undefined, duration);
    }
  },
};

// Redis Provider
export const redisProvider: ProviderDefinition = {
  id: 'redis',
  name: 'redis',
  displayName: 'Redis',
  category: 'database',
  description: 'Validate Redis connection credentials (supports Redis Cloud HTTP API)',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: false, placeholder: 'redis://user:pass@host:6379' },
    { name: 'host', label: 'Host', type: 'text', required: false, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '6379' },
    { name: 'password', label: 'Password', type: 'password', required: false },
    { name: 'http_api_url', label: 'Redis Cloud HTTP API URL', type: 'text', required: false, placeholder: 'https://redis-xxxxx.redislabs.com' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      let host = credentials.host || '';
      let port = credentials.port || '6379';
      let password = credentials.password || '';

      // Method 1: Try HTTP API if provided (Redis Cloud/Enterprise)
      if (credentials.http_api_url && password) {
        try {
          const { response, duration } = await safeRequest({
            method: 'GET',
            url: `${credentials.http_api_url}/ping`,
            headers: {
              'Authorization': `Bearer ${password}`,
            },
          });

          if (isSuccessResponse(response.status)) {
            return createValidationResult('valid', {
              host: credentials.http_api_url,
              method: 'HTTP API',
            }, undefined, undefined, response.status, duration);
          }

          if (response.status === 401 || response.status === 403) {
            return createValidationResult('invalid', undefined, 'Invalid Redis credentials', undefined, response.status, duration);
          }
        } catch (apiError) {
          // Fall through to connection string validation
        }
      }

      // Method 2: Parse connection string
      if (credentials.connection_string) {
        const connStr = credentials.connection_string;

        if (!connStr.startsWith('redis://') && !connStr.startsWith('rediss://')) {
          return createValidationResult('error', undefined, 'Invalid Redis connection string format. Must start with redis:// or rediss://');
        }

        try {
          const url = new URL(connStr);
          password = url.password || url.username || '';
          host = url.hostname || '';
          port = url.port || '6379';
        } catch (parseError) {
          return createValidationResult('error', undefined, 'Failed to parse Redis connection string');
        }
      }

      if (!host) {
        return createValidationResult('error', undefined, 'Missing required field: host is required');
      }

      // Format validation successful
      return createValidationResult('valid', {
        host,
        port,
        hasPassword: !!password,
        validationType: 'Format Validation',
        note: '✓ Redis connection string successfully parsed and validated',
      });
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// MySQL Provider
export const mysqlProvider: ProviderDefinition = {
  id: 'mysql',
  name: 'mysql',
  displayName: 'MySQL/MariaDB',
  category: 'database',
  description: 'Validate MySQL/MariaDB connection credentials and format',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: false, placeholder: 'mysql://user:pass@host:3306/dbname' },
    { name: 'host', label: 'Host', type: 'text', required: false, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '3306' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
    { name: 'database', label: 'Database', type: 'text', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      let host = credentials.host || '';
      let port = credentials.port || '3306';
      let username = credentials.username || '';
      let password = credentials.password || '';
      let database = credentials.database || '';

      // Parse connection string if provided
      if (credentials.connection_string) {
        const connStr = credentials.connection_string;

        if (!connStr.startsWith('mysql://')) {
          return createValidationResult('error', undefined, 'Invalid MySQL connection string format. Must start with mysql://');
        }

        try {
          const url = new URL(connStr);
          username = url.username || '';
          password = url.password || '';
          host = url.hostname || '';
          port = url.port || '3306';
          database = url.pathname.substring(1).split('?')[0] || '';
        } catch (parseError) {
          return createValidationResult('error', undefined, 'Failed to parse MySQL connection string');
        }
      }

      if (!host || !username || !password) {
        return createValidationResult('error', undefined, 'Missing required fields: host, username, and password are required');
      }

      // Format validation successful
      return createValidationResult('valid', {
        host,
        port,
        username,
        database: database || 'mysql',
        type: 'MySQL/MariaDB',
        validationType: 'Format Validation',
        note: '✓ MySQL connection string successfully parsed and validated',
      });
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Microsoft SQL Server Provider
export const mssqlProvider: ProviderDefinition = {
  id: 'mssql',
  name: 'mssql',
  displayName: 'Microsoft SQL Server',
  category: 'database',
  description: 'Validate MSSQL/SQL Server connection credentials and format',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: false, placeholder: 'Server=host;Database=db;User Id=user;Password=pass;' },
    { name: 'server', label: 'Server', type: 'text', required: false, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '1433' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
    { name: 'database', label: 'Database', type: 'text', required: false },
    { name: 'instance', label: 'Instance Name', type: 'text', required: false, placeholder: 'SQLEXPRESS' },
    { name: 'encrypt', label: 'Encrypt Connection', type: 'text', required: false, placeholder: 'true/false' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      let server = credentials.server || '';
      let port = credentials.port || '1433';
      let username = credentials.username || '';
      let password = credentials.password || '';
      let database = credentials.database || '';
      let instance = credentials.instance || '';
      let encrypt = credentials.encrypt || '';

      // Parse connection string if provided
      if (credentials.connection_string) {
        const connStr = credentials.connection_string;

        // Parse MSSQL connection string (key=value pairs separated by semicolons)
        const pairs = connStr.split(';').filter(p => p.trim());
        const params: Record<string, string> = {};

        pairs.forEach(pair => {
          const [key, ...valueParts] = pair.split('=');
          if (key && valueParts.length > 0) {
            params[key.trim().toLowerCase()] = valueParts.join('=').trim();
          }
        });

        server = params['server'] || params['data source'] || params['host'] || '';
        username = params['user id'] || params['uid'] || params['user'] || '';
        password = params['password'] || params['pwd'] || '';
        database = params['database'] || params['initial catalog'] || '';
        instance = params['instance'] || '';
        encrypt = params['encrypt'] || params['trustservercertificate'] || '';

        // Extract port from server string if present (e.g., "localhost:1433" or "localhost\SQLEXPRESS")
        if (server.includes(':')) {
          [server, port] = server.split(':');
        } else if (server.includes('\\')) {
          [server, instance] = server.split('\\');
        }
      }

      if (!server || !username || !password) {
        return createValidationResult('error', undefined, 'Missing required fields: server, username, and password are required');
      }

      // Format validation successful
      return createValidationResult('valid', {
        server,
        port,
        username,
        database: database || 'master',
        instance: instance || 'default',
        encrypt: encrypt || 'not specified',
        validationType: 'Format Validation',
        note: '✓ MSSQL connection string successfully parsed and validated',
      });
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Snowflake Provider
export const snowflakeProvider: ProviderDefinition = {
  id: 'snowflake',
  name: 'snowflake',
  displayName: 'Snowflake',
  category: 'database',
  description: 'Validate Snowflake credentials',
  inputFields: [
    { name: 'account_id', label: 'Account ID', type: 'text', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-west-2' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Snowflake validation requires JDBC driver - use custom test');
  },
};

// BigQuery Provider
export const bigqueryProvider: ProviderDefinition = {
  id: 'bigquery',
  name: 'bigquery',
  displayName: 'Google BigQuery',
  category: 'database',
  description: 'Validate BigQuery service account',
  inputFields: [
    { name: 'service_account_json', label: 'Service Account JSON', type: 'textarea', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const serviceAccount = JSON.parse(credentials.service_account_json || '{}');
      if (!serviceAccount.project_id) {
        return createValidationResult('invalid', undefined, 'Invalid service account JSON', undefined);
      }
      return createValidationResult('valid', {
        projectId: serviceAccount.project_id,
        email: serviceAccount.client_email
      }, undefined, undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Redshift Provider
export const redshiftProvider: ProviderDefinition = {
  id: 'redshift',
  name: 'redshift',
  displayName: 'Amazon Redshift',
  category: 'database',
  description: 'Validate Redshift credentials',
  inputFields: [
    { name: 'host', label: 'Cluster Host', type: 'text', required: true },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '5439' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'database', label: 'Database', type: 'text', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Redshift validation requires native driver - use custom test');
  },
};

// Elasticsearch Provider
export const elasticsearchProvider: ProviderDefinition = {
  id: 'elasticsearch',
  name: 'elasticsearch',
  displayName: 'Elasticsearch',
  category: 'database',
  description: 'Validate Elasticsearch credentials',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'https://elasticsearch.example.com' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = credentials.username && credentials.password
        ? { Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}` }
        : {};
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/_cluster/health`,
        headers: auth,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          clusterName: response.data.cluster_name,
          status: response.data.status
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Pinecone Provider
export const pineconeProvider: ProviderDefinition = {
  id: 'pinecone',
  name: 'pinecone',
  displayName: 'Pinecone',
  category: 'database',
  description: 'Validate Pinecone API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.pinecone.io/indexes',
        headers: { 'Api-Key': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          indexCount: response.data.indexes?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Weaviate Provider
export const weaviateProvider: ProviderDefinition = {
  id: 'weaviate',
  name: 'weaviate',
  displayName: 'Weaviate',
  category: 'database',
  description: 'Validate Weaviate instance access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'https://weaviate.example.com' },
    { name: 'api_key', label: 'API Key', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const headers = credentials.api_key ? { Authorization: `Bearer ${credentials.api_key}` } : {};
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/v1/.well-known/ready`,
        headers,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Weaviate instance unreachable', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Milvus Provider
export const milvusProvider: ProviderDefinition = {
  id: 'milvus',
  name: 'milvus',
  displayName: 'Milvus',
  category: 'database',
  description: 'Validate Milvus vector database access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '19530' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Milvus validation requires native driver - use custom test');
  },
};

// Qdrant Provider
export const qdrantProvider: ProviderDefinition = {
  id: 'qdrant',
  name: 'qdrant',
  displayName: 'Qdrant',
  category: 'database',
  description: 'Validate Qdrant vector database access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://localhost:6333' },
    { name: 'api_key', label: 'API Key', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const headers = credentials.api_key ? { 'api-key': credentials.api_key } : {};
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/health`,
        headers,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Qdrant unreachable', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// DuckDB Provider
export const duckdbProvider: ProviderDefinition = {
  id: 'duckdb',
  name: 'duckdb',
  displayName: 'DuckDB',
  category: 'database',
  description: 'Validate DuckDB database file access',
  inputFields: [
    { name: 'database_file', label: 'Database File Path', type: 'text', required: false, placeholder: ':memory: or /path/to/db.duckdb' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'DuckDB validation requires native driver - use custom test');
  },
};

// CockroachDB Provider
export const cockroachdbProvider: ProviderDefinition = {
  id: 'cockroachdb',
  name: 'cockroachdb',
  displayName: 'CockroachDB',
  category: 'database',
  description: 'Validate CockroachDB credentials',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: true, placeholder: 'postgresql://user:password@host:26257/db' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'CockroachDB validation requires native driver - use custom test');
  },
};

// YugabyteDB Provider
export const yugabyteProvider: ProviderDefinition = {
  id: 'yugabyte',
  name: 'yugabyte',
  displayName: 'YugabyteDB',
  category: 'database',
  description: 'Validate YugabyteDB credentials',
  inputFields: [
    { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '5433' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'YugabyteDB validation requires native driver - use custom test');
  },
};

// Cassandra Provider
export const cassandraProvider: ProviderDefinition = {
  id: 'cassandra',
  name: 'cassandra',
  displayName: 'Apache Cassandra',
  category: 'database',
  description: 'Validate Cassandra cluster credentials',
  inputFields: [
    { name: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
    { name: 'port', label: 'Port', type: 'text', required: false, placeholder: '9042' },
    { name: 'username', label: 'Username', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Cassandra validation requires native driver - use custom test');
  },
};

// Firestore Provider
export const firestoreProvider: ProviderDefinition = {
  id: 'firestore',
  name: 'firestore',
  displayName: 'Google Firestore',
  category: 'database',
  description: 'Validate Firestore service account',
  inputFields: [
    { name: 'service_account_json', label: 'Service Account JSON', type: 'textarea', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const serviceAccount = JSON.parse(credentials.service_account_json || '{}');
      if (!serviceAccount.project_id) {
        return createValidationResult('invalid', undefined, 'Invalid service account JSON', undefined);
      }
      return createValidationResult('valid', {
        projectId: serviceAccount.project_id,
        email: serviceAccount.client_email
      }, undefined, undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// DynamoDB Provider
export const dynamodbProvider: ProviderDefinition = {
  id: 'dynamodb',
  name: 'dynamodb',
  displayName: 'Amazon DynamoDB',
  category: 'database',
  description: 'Validate DynamoDB credentials',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-east-1' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'DynamoDB validation requires AWS signature - use custom test');
  },
};

// Cosmos DB Provider
export const cosmosdbProvider: ProviderDefinition = {
  id: 'cosmosdb',
  name: 'cosmosdb',
  displayName: 'Azure Cosmos DB',
  category: 'database',
  description: 'Validate Cosmos DB credentials',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const connectionString = credentials.connection_string || '';
      if (connectionString.includes('AccountEndpoint=')) {
        return createValidationResult('valid', {}, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Invalid connection string', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Supabase Provider
export const supabaseProvider: ProviderDefinition = {
  id: 'supabase',
  name: 'supabase',
  displayName: 'Supabase',
  category: 'database',
  description: 'Validate Supabase project credentials',
  inputFields: [
    { name: 'project_url', label: 'Project URL', type: 'url', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.project_url}/rest/v1/`,
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
