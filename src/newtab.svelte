<script lang="ts">
  export let data = "";
</script>

<div style="display: flex; flexDirection: column; padding: 16">
  <h1>
    Welcome to your <a href="https://www.plasmo.com">Plasmo</a> Extension!
  </h1>
  <input bind:value={data} />
  <footer>Crafted by @PlamoHQ</footer>
</div>

<style>
  @import "./style.css";
</style>
