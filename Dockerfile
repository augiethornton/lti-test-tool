FROM instructure/node:7.5-yarn

USER root

ENV APP_HOME /usr/src/app/

COPY . $APP_HOME

RUN npm install

RUN chown -R docker:docker $APP_HOME

USER docker

EXPOSE 3000
CMD ["node", "app.js"]
