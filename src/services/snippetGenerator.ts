import { ApiEndpoint, CodeLanguage, CodeSnippet } from '../types/openapi';

export function generateCodeSnippets(
  endpoint: ApiEndpoint,
  apiKey: string = 'cw_live_sk_8f92a10b4829ec7193bd720194aa82',
  customBody?: string
): CodeSnippet[] {
  const baseUrl = 'https://api.certiwatch.io';
  const url = `${baseUrl}${endpoint.path.replace('{id}', 'cert-1').replace('{gs1DigitalLink}', '01036000291452')}`;
  const method = endpoint.method;
  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const bodyPayload = customBody || (endpoint.requestBodyExample ? JSON.stringify(endpoint.requestBodyExample, null, 2) : '');

  // 1. cURL
  let curlCode = `curl -X ${method} "${url}" \\\n  -H "Accept: application/json"`;
  if (endpoint.requiresAuth) {
    curlCode += ` \\\n  -H "X-API-Key: ${apiKey}"`;
  }
  if (hasBody && bodyPayload) {
    curlCode += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyPayload.replace(/'/g, "'\\''")}'`;
  }

  // 2. Node.js (Fetch)
  let nodeCode = `// Node.js (Node 18+ natif ou browser)\n`;
  nodeCode += `const response = await fetch("${url}", {\n`;
  nodeCode += `  method: "${method}",\n`;
  nodeCode += `  headers: {\n`;
  nodeCode += `    "Accept": "application/json",\n`;
  if (hasBody) {
    nodeCode += `    "Content-Type": "application/json",\n`;
  }
  if (endpoint.requiresAuth) {
    nodeCode += `    "X-API-Key": "${apiKey}",\n`;
  }
  nodeCode += `  },\n`;
  if (hasBody && bodyPayload) {
    nodeCode += `  body: JSON.stringify(${bodyPayload}),\n`;
  }
  nodeCode += `});\n\n`;
  nodeCode += `const data = await response.json();\n`;
  nodeCode += `console.log("CertiWatch Response:", data);`;

  // 3. Python (requests)
  let pythonCode = `import requests\nimport json\n\n`;
  pythonCode += `url = "${url}"\n`;
  pythonCode += `headers = {\n`;
  pythonCode += `    "Accept": "application/json",\n`;
  if (endpoint.requiresAuth) {
    pythonCode += `    "X-API-Key": "${apiKey}",\n`;
  }
  if (hasBody) {
    pythonCode += `    "Content-Type": "application/json",\n`;
  }
  pythonCode += `}\n\n`;
  if (hasBody && bodyPayload) {
    pythonCode += `payload = ${bodyPayload}\n\n`;
    pythonCode += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
  } else {
    pythonCode += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
  }
  pythonCode += `print("Status:", response.status_code)\n`;
  pythonCode += `print(json.dumps(response.json(), indent=2))`;

  // 4. Java (OkHttp)
  let javaCode = `import okhttp3.*;\nimport java.io.IOException;\n\npublic class CertiWatchClient {\n`;
  javaCode += `    public static void main(String[] args) throws IOException {\n`;
  javaCode += `        OkHttpClient client = new OkHttpClient();\n\n`;
  if (hasBody && bodyPayload) {
    javaCode += `        MediaType JSON = MediaType.parse("application/json; charset=utf-8");\n`;
    javaCode += `        RequestBody body = RequestBody.create(JSON, ${JSON.stringify(bodyPayload)});\n`;
    javaCode += `        Request request = new Request.Builder()\n`;
    javaCode += `            .url("${url}")\n`;
    javaCode += `            .${method.toLowerCase()}(body)\n`;
  } else {
    javaCode += `        Request request = new Request.Builder()\n`;
    javaCode += `            .url("${url}")\n`;
    javaCode += `            .${method.toLowerCase()}()\n`;
  }
  if (endpoint.requiresAuth) {
    javaCode += `            .addHeader("X-API-Key", "${apiKey}")\n`;
  }
  javaCode += `            .addHeader("Accept", "application/json")\n`;
  javaCode += `            .build();\n\n`;
  javaCode += `        try (Response response = client.newCall(request).execute()) {\n`;
  javaCode += `            System.out.println(response.body().string());\n`;
  javaCode += `        }\n    }\n}`;

  // 5. SAP ABAP / RFC (cl_http_client)
  let abapCode = `* SAP ABAP Integration for CertiWatch ERP Matrix Validation\n`;
  abapCode += `DATA: lo_http_client TYPE REF TO if_http_client,\n`;
  abapCode += `      lv_response    TYPE string,\n`;
  abapCode += `      lv_payload     TYPE string.\n\n`;
  abapCode += `cl_http_client=>create_by_url(\n`;
  abapCode += `  EXPORTING url = '${url}'\n`;
  abapCode += `  IMPORTING client = lo_http_client ).\n\n`;
  abapCode += `lo_http_client->request->set_method( '${method}' ).\n`;
  if (endpoint.requiresAuth) {
    abapCode += `lo_http_client->request->set_header_field( name = 'X-API-Key' value = '${apiKey}' ).\n`;
  }
  abapCode += `lo_http_client->request->set_header_field( name = 'Accept' value = 'application/json' ).\n`;
  if (hasBody && bodyPayload) {
    abapCode += `lo_http_client->request->set_header_field( name = 'Content-Type' value = 'application/json' ).\n`;
    abapCode += `lv_payload = '${bodyPayload.replace(/'/g, "''").replace(/\n/g, '')}'.\n`;
    abapCode += `lo_http_client->request->set_cdata( lv_payload ).\n`;
  }
  abapCode += `\nlo_http_client->send( ).\n`;
  abapCode += `lo_http_client->receive( ).\n`;
  abapCode += `lv_response = lo_http_client->response->get_cdata( ).\n`;
  abapCode += `WRITE: / 'CertiWatch Response:', lv_response.`;

  return [
    { language: 'curl', label: 'cURL', code: curlCode },
    { language: 'node', label: 'Node.js / TS', code: nodeCode },
    { language: 'python', label: 'Python 3', code: pythonCode },
    { language: 'java', label: 'Java (OkHttp)', code: javaCode },
    { language: 'sap_abap', label: 'SAP ABAP (S/4HANA)', code: abapCode },
  ];
}
