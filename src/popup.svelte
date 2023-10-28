<script lang="ts">
  let positiveKey = "";
  let negativeKey = "";
</script>

<p>Edit your clicking keys!</p>

<div>
  <label for="pos-key">Positive (+1): </label>
  <input
    bind:value={positiveKey}
    id="pos-key"
    name="pos-key"
    type="text"
    minlength="1"
    maxlength="1"
    size="2"
    required
  />
  <span class="validity" />
</div>

<div>
  <label for="neg-key">Negative (-1): </label>
  <input
    bind:value={negativeKey}
    id="neg-key"
    name="neg-key"
    type="text"
    minlength="1"
    maxlength="1"
    size="2"
    required
  />
  <span class="validity" />
</div>

<style>
  :global(html) {
    min-height: 10em;
    min-width: 20em;
    background: #282b30;
    color: aliceblue;
  }

  /* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#specifying_a_pattern */
  input + span {
    padding-right: 30px;
  }
  input:invalid + span::after {
    position: absolute;
    content: "✖";
    padding-left: 5px;
  }
  input:valid + span::after {
    position: absolute;
    content: "✓";
    padding-left: 5px;
  }
</style>
