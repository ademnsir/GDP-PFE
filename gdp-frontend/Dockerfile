FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# 3001 = port utilisé par Next.js
EXPOSE 3001

CMD ["npm", "run", "start"]
