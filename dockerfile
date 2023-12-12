FROM beevelop/cordova

RUN apt-get update && \
  apt-get install -y git unzip && \
  wget https://dl.google.com/android/repository/commandlinetools-linux-7302050_latest.zip && \
  unzip commandlinetools-linux-7302050_latest.zip && \
  rm commandlinetools-linux-7302050_latest.zip && \
  mkdir -p /usr/lib/android-sdk/cmdline-tools && \
  mv cmdline-tools /usr/lib/android-sdk/cmdline-tools/latest && \
  rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/lib/android-sdk/cmdline-tools/latest/bin:/usr/lib/android-sdk/platform-tools:${PATH}"
RUN yes | sdkmanager --licenses && sdkmanager --update

RUN npm install -g webpack @types/jest @vscode/vsce cordova jest typescript webpack-cli webpack
WORKDIR /workspace
COPY . .
RUN npm install && \
  npx webpack --config webpack.prod.js && \
  cp -r dist/* cordova-app/www/ && \
  cd cordova-app && \
  cordova platform add android && \
  git config --global user.email "peter@mcdonald.xyz" && \
  git config --global user.name "Peter McDonald" && \
  git config --global commit.gpgsign false && \
  git config --local commit.gpgsign false