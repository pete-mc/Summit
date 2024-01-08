<template>
  <div>
    <button @click="sendToken">Launch Topo</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as forge from 'node-forge';

export default defineComponent({
  name: 'TokenSender',
  methods: {
    encryptToken(publicKey: string, token: string): string {
      const key = forge.pki.publicKeyFromPem(publicKey);
      const encrypted = key.encrypt(token, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });
      return forge.util.encode64(encrypted);
    },
    sendToken() {
      const publicKey = `-----BEGIN PUBLIC KEY-----
      ...
      -----END PUBLIC KEY-----`;  // Replace with actual public key from the topo private key
      const authToken = $nuxt.$store.state.auth.accessToken;
      const encryptedToken = this.encryptToken(publicKey, authToken);

      // Open Topo in a new window and send the encrypted token
      const targetUrl = ' https://nomisnostab.github.io/Topo-Blazor';
      const targetWindow = window.open(targetUrl, '_blank');

      if (targetWindow) {
        // Wait for the new window to load, then send the encrypted token
        targetWindow.onload = () => {
          targetWindow.postMessage(encryptedToken, targetUrl);
        };
      } else {
        console.error('Failed to open the target website.');
      }
    }
  }
});
</script>
