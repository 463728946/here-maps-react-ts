FROM node:16.7

COPY ./ /app

WORKDIR /app


RUN npm config set @here:registry https://repo.platform.here.com/artifactory/api/npm/maps-api-for-javascript/
RUN npm install 
RUN npm run build

FROM nginx

# RUN mkdir /apps

COPY --from=0 /app/build /usr/share/nginx/html


# COPY nginx.conf /etc/nginx/nginx.conf
# 