import { Controller, Get, Param, Res } from "@nestjs/common";
import { TechnologyVersionService } from "../services/technology-version.service";
import { Response } from "express";
import axios from "axios";

@Controller("technology")
export class TechnologyController {
  constructor(private readonly technologyVersionService: TechnologyVersionService) {}

  @Get("/version/:name")
  async getLatestVersion(@Param("name") name: string) {
    const latestVersion = await this.technologyVersionService.getLatestVersion(name);
    
    if (!latestVersion) {
      return { error: `Version introuvable pour ${name}` };
    }

    return { technology: name, latestVersion };
  }

  @Get("/download/:name")
  async downloadTechnology(@Param("name") name: string, @Res() res: Response) {
    try {
      const tech = name.toLowerCase();
      const isWindows = process.platform === "win32";
      console.log(`📥 Demande de téléchargement pour : ${tech}`);

      const latestVersion = await this.technologyVersionService.getLatestVersion(tech);

      if (!latestVersion) {
        console.error(`❌ Version introuvable pour ${tech}`);
        return res.status(404).json({ error: `Version introuvable pour ${tech}` });
      }

      const downloadUrls: Record<string, string> = {

    "node.js": isWindows
  ? `https://nodejs.org/dist/v${latestVersion.replace(/^v/, '')}/node-v${latestVersion.replace(/^v/, '')}-x64.msi`
  : `https://nodejs.org/dist/v${latestVersion.replace(/^v/, '')}/node-v${latestVersion.replace(/^v/, '')}-linux-x64.tar.xz`,

   
        "next.js": `https://registry.npmjs.org/next/-/next-${latestVersion}.tgz`,
        "nestjs": `https://registry.npmjs.org/@nestjs/core/-/core-${latestVersion}.tgz`,
        "express": `https://registry.npmjs.org/express/-/express-${latestVersion}.tgz`,
        "python": `https://www.python.org/ftp/python/${latestVersion}/Python-${latestVersion}.tgz`,
        "django": `https://files.pythonhosted.org/packages/source/D/Django/Django-${latestVersion}.tar.gz`,
        "go": `https://go.dev/dl/go${latestVersion}.linux-amd64.tar.gz`,
        "rust": `https://static.rust-lang.org/dist/rust-${latestVersion}-x86_64-unknown-linux-gnu.tar.gz`,
      };

      const downloadUrl = downloadUrls[tech];

      if (!downloadUrl) {
        console.error(`❌ Aucun lien de téléchargement disponible pour ${tech}`);
        return res.status(400).json({ error: "Aucun lien de téléchargement disponible." });
      }

      console.log(`🔗 Lien de téléchargement généré: ${downloadUrl}`);

      // Vérifier si le fichier est accessible
      const fileResponse = await axios.head(downloadUrl);
      if (fileResponse.status !== 200) {
        console.error(`❌ Fichier introuvable: ${downloadUrl}`);
        return res.status(404).json({ error: "Le fichier à télécharger n'existe pas." });
      }

      // Télécharger et envoyer le fichier
      const fileStream = await axios.get(downloadUrl, { responseType: "stream" });

      res.setHeader("Content-Disposition", `attachment; filename=${tech}-${latestVersion}.tar.gz`);
      res.setHeader("Content-Type", "application/octet-stream");

      fileStream.data.pipe(res);
    } catch (error) {
      console.error(`❌ Erreur lors du téléchargement de ${name}:`, error);
      res.status(500).json({ error: "Erreur lors du téléchargement." });
    }
  }
}
