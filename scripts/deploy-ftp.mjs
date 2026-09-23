import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  const host = process.env.FTP_SERVER;
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;

  if (!host || !user || !password) {
    console.error('❌ Credenciais de FTP não encontradas nas variáveis de ambiente.');
    process.exit(1);
  }

  try {
    console.log(`🔌 Conectando ao servidor FTP ${host}...`);
    await client.access({
      host,
      user,
      password,
      secure: false,
    });
    console.log('✅ Conexão FTP estabelecida com sucesso!');

    const rootList = await client.list();
    console.log('📁 Estrutura da raiz do FTP:');
    rootList.forEach(item => console.log(`  - ${item.name} (${item.isDirectory ? 'pasta' : 'arquivo'})`));

    // Determinar o diretório de destino
    let targetDir = 'public_html';
    
    // Verificar se existe pasta domains
    const hasDomains = rootList.some(item => item.name === 'domains' && item.isDirectory);
    if (hasDomains) {
      await client.cd('domains');
      const domainsList = await client.list();
      console.log('📁 Domínios encontrados:', domainsList.map(d => d.name).join(', '));
      
      const domainFolder = domainsList.find(d => d.name.includes('orangered-antelope') || d.isDirectory);
      if (domainFolder) {
        targetDir = `domains/${domainFolder.name}/public_html`;
      }
      await client.cd('/');
    }

    console.log(`🚀 Fazendo upload dos arquivos de ${distDir} para /${targetDir}...`);
    await client.ensureDir(targetDir);
    await client.clearWorkingDir();
    await client.uploadFromDir(distDir);

    console.log('🎉 Upload concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
