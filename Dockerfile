###################
# BUILD FOR PRODUCTION
###################

FROM node:16-slim as build
RUN apt-get update
RUN apt-get install -y openssl
WORKDIR /usr/src/app

COPY package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN yarn

COPY . .
# Run the build command which creates the production bundle
RUN yarn build

# Passing in --only=production ensures that only the production dependencies are installed.
# This ensures that the node_modules directory is as optimized as possible.
RUN yarn --prod

###################
# PRODUCTION
###################

FROM node:16-slim 
RUN apt-get update
RUN apt-get install -y openssl


# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/package*.json ./
RUN yarn
#COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3001

# Start the server using the production build
CMD ["node", "dist/src/main"]
