# build
FROM node:lts as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -f .npmrc
RUN npm run build

# production
FROM nginx:stable-alpine
COPY --from=build /app/dist/web-app /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
RUN ln -sf /dev/null /var/log/nginx/access.log
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
