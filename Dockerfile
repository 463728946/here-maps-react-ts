FROM node:10

COPY ./ /app

WORKDIR /app

RUN npm config set @here:registry https://repo.platform.here.com/artifactory/api/npm/maps-api-for-javascript/
RUN npm install && npm run build

FROM nginx

RUN mkdir /app

COPY --from=0 /app/dist /app

COPY nginx.conf /etc/nginx/nginx.conf
