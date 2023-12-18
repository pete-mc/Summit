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

RUN npm install -g webpack @types/jest @vscode/vsce cordova jest typescript webpack-cli webpack npm-run-all
WORKDIR /workspace
COPY . .
RUN git config --global user.email "peter@mcdonald.xyz" && \
  git config --global user.name "Peter McDonald" && \
  git config --global commit.gpgsign false
