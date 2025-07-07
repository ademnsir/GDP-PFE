import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTacheIdToBigInt1712772000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Sauvegarder les données existantes
        await queryRunner.query(`
            CREATE TABLE public.tache_temp AS SELECT * FROM public.tache;
        `);

        // Supprimer la table existante
        await queryRunner.query(`
            DROP TABLE public.tache CASCADE;
        `);

        // Recréer la table avec bigint
        await queryRunner.query(`
            CREATE TABLE public.tache (
                id bigint NOT NULL,
                title character varying NOT NULL,
                description character varying NOT NULL,
                status public.tache_status_enum DEFAULT 'To Do'::public.tache_status_enum NOT NULL,
                priority public.tache_priority_enum DEFAULT 'low'::public.tache_priority_enum NOT NULL,
                type character varying,
                "customType" character varying,
                "creationDate" timestamp without time zone DEFAULT now(),
                "userId" integer,
                "projectId" integer
            );
        `);

        // Recréer la séquence avec bigint
        await queryRunner.query(`
            CREATE SEQUENCE public.tache_id_seq
                AS bigint
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;
        `);

        // Restaurer les données
        await queryRunner.query(`
            INSERT INTO public.tache SELECT * FROM public.tache_temp;
        `);

        // Supprimer la table temporaire
        await queryRunner.query(`
            DROP TABLE public.tache_temp;
        `);

        // Mettre à jour la séquence
        await queryRunner.query(`
            SELECT setval('public.tache_id_seq', COALESCE((SELECT MAX(id) FROM public.tache), 0) + 1, false);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Sauvegarder les données existantes
        await queryRunner.query(`
            CREATE TABLE public.tache_temp AS SELECT * FROM public.tache;
        `);

        // Supprimer la table existante
        await queryRunner.query(`
            DROP TABLE public.tache CASCADE;
        `);

        // Recréer la table avec integer
        await queryRunner.query(`
            CREATE TABLE public.tache (
                id integer NOT NULL,
                title character varying NOT NULL,
                description character varying NOT NULL,
                status public.tache_status_enum DEFAULT 'To Do'::public.tache_status_enum NOT NULL,
                priority public.tache_priority_enum DEFAULT 'low'::public.tache_priority_enum NOT NULL,
                type character varying,
                "customType" character varying,
                "creationDate" timestamp without time zone DEFAULT now(),
                "userId" integer,
                "projectId" integer
            );
        `);

        // Recréer la séquence avec integer
        await queryRunner.query(`
            CREATE SEQUENCE public.tache_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;
        `);

        // Restaurer les données
        await queryRunner.query(`
            INSERT INTO public.tache SELECT * FROM public.tache_temp;
        `);

        // Supprimer la table temporaire
        await queryRunner.query(`
            DROP TABLE public.tache_temp;
        `);

        // Mettre à jour la séquence
        await queryRunner.query(`
            SELECT setval('public.tache_id_seq', COALESCE((SELECT MAX(id) FROM public.tache), 0) + 1, false);
        `);
    }
} 