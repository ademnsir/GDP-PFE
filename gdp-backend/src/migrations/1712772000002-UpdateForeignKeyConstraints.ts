import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateForeignKeyConstraints1712772000002 implements MigrationInterface {
    name = 'UpdateForeignKeyConstraints1712772000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les anciennes contraintes
        await queryRunner.query(`ALTER TABLE "conge" DROP CONSTRAINT IF EXISTS "FK_78953628d9f0630ec9f36ab1adb"`);
        
        // Recréer la contrainte avec CASCADE DELETE
        await queryRunner.query(`ALTER TABLE "conge" ADD CONSTRAINT "FK_78953628d9f0630ec9f36ab1adb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer la nouvelle contrainte
        await queryRunner.query(`ALTER TABLE "conge" DROP CONSTRAINT IF EXISTS "FK_78953628d9f0630ec9f36ab1adb"`);
        
        // Recréer l'ancienne contrainte sans CASCADE
        await queryRunner.query(`ALTER TABLE "conge" ADD CONSTRAINT "FK_78953628d9f0630ec9f36ab1adb" FOREIGN KEY ("userId") REFERENCES "user"("id")`);
    }
} 