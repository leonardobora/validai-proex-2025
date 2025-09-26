import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { usersTable } from "../shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Carregar variáveis de ambiente
config();

// Script para gerenciar usuários admin
async function manageAdmin() {
  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.log("❌ DATABASE_URL não está configurada!");
      console.log("\n🔧 Para configurar:");
      console.log("1. Crie um arquivo .env na raiz do projeto");
      console.log("2. Adicione: DATABASE_URL=postgresql://...");
      console.log("3. Ou execute: export DATABASE_URL=postgresql://...");
      return;
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    const email = "leo@dev.com";
    
    // Buscar usuário
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      // Criar usuário admin se não existir
      console.log(`🆕 Criando usuário admin: ${email}`);
      
      const newUser = await db
        .insert(usersTable)
        .values({
          id: randomUUID(),
          email: email,
          name: "Leonardo Admin",
          passwordHash: "temp-password-hash", // Placeholder - auth será feita via OAuth
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log(`✅ Usuário admin criado com sucesso!`);
      console.log(`📧 Email: ${newUser[0].email}`);
      console.log(`👤 Nome: ${newUser[0].name}`);
      console.log(`👑 Admin: ${newUser[0].isAdmin}`);
      
    } else {
      const user = existingUser[0];
      console.log(`\n📋 Usuário encontrado: ${email}`);
      console.log(`👤 Nome: ${user.name}`);
      console.log(`👑 Admin: ${user.isAdmin ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`📅 Criado: ${user.createdAt}`);

      if (!user.isAdmin) {
        console.log(`\n🔄 Tornando usuário admin...`);
        
        await db
          .update(usersTable)
          .set({ 
            isAdmin: true,
            updatedAt: new Date()
          })
          .where(eq(usersTable.email, email));

        console.log(`✅ Usuário ${email} agora é admin!`);
      }
    }

  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

// Mostrar instruções se DATABASE_URL não estiver configurada
console.log("🔍 Verificando configuração e status de admin...\n");

manageAdmin()
  .then(() => {
    console.log("\n✅ Processo concluído");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });