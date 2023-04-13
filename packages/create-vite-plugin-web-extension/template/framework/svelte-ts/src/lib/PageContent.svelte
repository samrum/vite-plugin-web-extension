<script lang="ts">
  import logo from "~/assets/logo.svg";

  const imageUrl = new URL(logo, import.meta.url).href;

  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<img src={imageUrl} height="45" alt="" />
<h1>
  <slot></slot>
</h1>
<button type="button" on:click={increment}>
  Clicks: {count}
</button>

<style>
  h1 {
    margin: 5px;
  }
  
  button {
    margin-top: 10px;
  }
</style>
