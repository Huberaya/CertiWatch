export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'body';
  required: boolean;
  type: string;
  description: string;
  default?: string | number | boolean;
  example?: string | number | boolean;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  tag: string;
  requiresAuth: boolean;
  parameters?: ApiParameter[];
  requestBodyExample?: any;
  responseExamples: {
    status: number;
    description: string;
    body: any;
  }[];
}

export type CodeLanguage = 'curl' | 'node' | 'python' | 'java' | 'sap_abap';

export interface CodeSnippet {
  language: CodeLanguage;
  label: string;
  code: string;
}
