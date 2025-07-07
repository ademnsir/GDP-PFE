import { Injectable } from "@nestjs/common";
import axios from "axios";
import { chromium } from "playwright"; 

@Injectable()
export class TechnologyVersionService {
  private apiUrls: Record<string, string> = {
    // ✅ Backend
    "node.js": "https://nodejs.org/dist/index.json",
    "next.js": "https://registry.npmjs.org/next/latest",
    nestjs: "https://registry.npmjs.org/@nestjs/core/latest",
    express: "https://registry.npmjs.org/express/latest",
    "spring boot": "https://start.spring.io/metadata/client",
    python: "https://pypi.org/pypi/python/json",
    django: "https://pypi.org/pypi/Django/json",
    flask: "https://pypi.org/pypi/Flask/json",
    fastapi: "https://pypi.org/pypi/fastapi/json",
    "asp.net": "https://dotnet.microsoft.com/en-us/download/dotnet",
    go: "https://go.dev/VERSION?m=text",
    rust: "https://forge.rust-lang.org/infra/release-archives.html",
    "ruby on rails": "https://rubygems.org/api/v1/versions/rails/latest.json",
    laravel: "https://packagist.org/packages/laravel/framework.json",
    symfony: "https://repo.packagist.org/p2/symfony/symfony.json",
    phoenix: "https://hex.pm/api/packages/phoenix",
    
    // ✅ Frontend
    "next.js frontend": "https://registry.npmjs.org/next/latest",
    react: "https://registry.npmjs.org/react/latest",
    angular: "https://registry.npmjs.org/@angular/core/latest",
    vue: "https://registry.npmjs.org/vue/latest",
    svelte: "https://registry.npmjs.org/svelte/latest",
    "solid.js": "https://registry.npmjs.org/solid-js/latest",
    astro: "https://registry.npmjs.org/astro/latest",
  };

  private scrapingUrls: Record<string, string> = {
    "node.js": "https://nodejs.org/en/download/",
    "next.js": "https://nextjs.org/",
    "next.js frontend": "https://nextjs.org/",
    react: "https://react.dev/",
    angular: "https://angular.io/",
    vue: "https://vuejs.org/",
    svelte: "https://svelte.dev/",
    django: "https://www.djangoproject.com/download/",
    flask: "https://flask.palletsprojects.com/en/latest/",
    "asp.net": "https://dotnet.microsoft.com/en-us/download/dotnet",
    go: "https://go.dev/dl/",
    rust: "https://forge.rust-lang.org/infra/release-archives.html",
    phoenix: "https://hexdocs.pm/phoenix/overview.html",
  };

  async getLatestVersion(technology: string): Promise<string | null> {
    const tech = technology.toLowerCase();
    const apiUrl = this.apiUrls[tech];

    if (apiUrl) {
      try {
     
        const { data } = await axios.get(apiUrl);

        if (tech === "node.js") {
          return data[0].version;
        } else if (["next.js", "next.js frontend", "react", "angular", "vue", "express", "nestjs", "svelte", "solid.js", "astro"].includes(tech)) {
          return data.version;
        } else if (["python", "django", "flask", "fastapi"].includes(tech)) {
          return data.info.version;
        } else if (tech === "spring boot") {
          return data.bootVersion.default;
        } else if (tech === "laravel") {
          return data.package.versions[Object.keys(data.package.versions)[0]].version;
        } else if (tech === "ruby on rails") {
          return data.version;
        } else if (tech === "symfony") {
          return data.packages["symfony/symfony"][0].version;
        } else if (tech === "phoenix") {
          return data.releases[0].version;
        } else if (tech === "go") {
          return data.trim();
        }

        return null;
      } catch (error) {
        console.error(`❌ Erreur API ${technology}:`, error.message);
      }
    }

    // Si aucune API n'est trouvée, tenter le Web Scraping avec Playwright
    return await this.scrapeVersion(tech);
  }

  private async scrapeVersion(technology: string): Promise<string | null> {
    const url = this.scrapingUrls[technology];

    if (!url) {
      console.error(`❌ Aucune URL de scraping pour ${technology}`);
      return null;
    }

    try {
      console.log(`🔍 Scraping version pour ${technology} depuis ${url}`);

      // 🚀 Lancer un navigateur Playwright headless
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      let latestVersion: string | null = null;

      if (technology === "node.js") {
        latestVersion = await page.textContent(".home-downloadbutton");
      } else if (technology === "next.js" || technology === "next.js frontend") {
        latestVersion = await page.textContent("h2:has-text('Latest version') + p");
      } else if (technology === "react") {
        const metaDescription = await page.getAttribute("meta[property='og:description']", "content");
        latestVersion = metaDescription?.match(/React (\d+\.\d+\.\d+)/)?.[1] || null;
      } else if (technology === "angular") {
        latestVersion = await page.textContent(".home-hero__latest-version");
      } else if (technology === "vue") {
        latestVersion = await page.textContent(".hero .version");
      } else if (technology === "svelte") {
        latestVersion = await page.textContent(".svelte-hero-version");
      } else if (technology === "django") {
        latestVersion = await page.textContent("h3:has-text('Latest release') + p");
      } else if (technology === "flask") {
        latestVersion = await page.textContent(".sidebar .release");
      } else if (technology === "asp.net") {
        latestVersion = await page.textContent(".version-badge");
      } else if (technology === "go") {
        latestVersion = await page.textContent(".version");
      } else if (technology === "rust") {
        latestVersion = await page.textContent(".release-version");
      } else if (technology === "phoenix") {
        latestVersion = await page.textContent(".sidebar .latest-release");
      }

      await browser.close();
      return latestVersion?.trim() || null;
    } catch (error) {
      console.error(`❌ Erreur de scraping ${technology} avec Playwright:`, error.message);
      return null;
    }
  }



}
