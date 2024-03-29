<template>
<div id="topo-container" style="width:100%; height:100%; border:none;">
    <h2 id="topo">Topo Reporting App</h2>
    <p>
        Topo is a Blazor WebAssembly application designed to assist scout leaders. It enables efficient and easy generation of reports from the Scouts Australia Terrain system.
    </p>

    <p>
        Key features of Topo include:
        <ul>
            <li>Interactive and user-friendly interface for data entry and report generation.</li>
            <li>Seamless integration with Scouts Australia's Terrain system.</li>
            <li>Real-time data processing and visualization tools.</li>
            <li>Accessible as a web application without the need for installation.</li>
            <li>Comprehensive documentation and support via its Wiki page.</li>
        </ul>
    </p>

    <button class="savebtn mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn" onclick="window.open('https:\/\/nomisnostab.github.io\/Topo-Blazor\/', '_blank')">
        Launch Topo
    </button>

    <p>Please click the button to access Topo. A new tab will open where Topo will start. We are hoping to remove the need to login again in a future release.</p>

    <button class="savebtn mr-4 v-btn v-btn--outline theme--light v-size--default summit-menu-outline" onclick="window.open('https:\/\/github.com/NomisNostab\/Topo-Blazor\/wiki\/Home-Page', '_blank')">
        Visit the Wiki Page
    </button>

    <p>Thank you Simon Batson and team for your great efforts in making this reporting app possible. Please raise any issues you encounter or feature requests for Topo on it's <a rel="noopener" href="https://github.com/NomisNostab/Topo-Blazor/issues" target="_blank">Github Issues page</a>. </p>
</div>

</template>

<script lang="ts" src="./Topo.ts"></script>

<style scoped>
/* Your component-specific styles here */
</style>
