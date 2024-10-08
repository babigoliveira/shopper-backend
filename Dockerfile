FROM node:20.17-alpine

ARG GEMINI_API_KEY
ARG GEMINI_GENERATIVE_MODEL_VERSION

ENV GEMINI_API_KEY $GEMINI_API_KEY
ENV GEMINI_GENERATIVE_MODEL_VERSION $GEMINI_GENERATIVE_MODEL_VERSION


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
