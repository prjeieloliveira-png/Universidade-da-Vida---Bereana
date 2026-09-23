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

    const targets = ['public_html'];
    
    const hasDomains = rootList.some(item => item.name === 'domains' && item.isDirectory);
    if (hasDomains) {
      await client.cd('domains');
      const domainsList = await client.list();
      console.log('📁 Domínios encontrados:', domainsList.map(d => d.name).join(', '));
      for (const d of domainsList) {
        if (d.isDirectory) {
          targets.push(`domains/${d.name}/public_html`);
        }
      }
      await client.cd('/');
    }

    console.log('🎯 Diretórios alvos para sincronização:', targets);

    for (const target of targets) {
      try {
        console.log(`🚀 Sincronizando para /${target}...`);
        await client.ensureDir(`/${target}`);
        await client.uploadFromDir(distDir);
        console.log(`✅ Sincronizado com sucesso em /${target}`);
      } catch (uploadErr) {
        console.warn(`⚠️ Não foi possível sincronizar em /${target}:`, uploadErr.message);
      }
    }

    console.log('🎉 Upload finalizado com sucesso em todos os destinos!');
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
