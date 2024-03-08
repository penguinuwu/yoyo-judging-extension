<script lang="ts">
  import { Storage } from "@plasmohq/storage";
  import { StorageKey } from "~contents/constants";

  const storage = new Storage();

  let positiveNode: HTMLInputElement = undefined;
  let negativeNode: HTMLInputElement = undefined;
  let positiveKey: string = undefined;
  let negativeKey: string = undefined;

  // watch for key binding changes
  storage.watch({
    [StorageKey.PositiveKey]: (c) => {
      console.debug(`positiveKey: ${c.newValue}`);
      positiveKey = c.newValue;
      validateKeys();
    },
    [StorageKey.NegativeKey]: (c) => {
      console.debug(`negativeKey: ${c.newValue}`);
      negativeKey = c.newValue;
      validateKeys();
    }
  });

  /**
   * validate keys and show results on ui
   */
  function validateKeys() {
    // check if keys are not unique
    if (positiveKey === negativeKey) {
      console.debug(`duplicate key binds "${positiveKey}", "${negativeKey}"`);
      negativeNode.setCustomValidity("Invalid duplicate key bind!");
      positiveNode.setCustomValidity("Invalid duplicate key bind!");
    } else {
      // check if keys are valid, and reset custom validity
      negativeNode.setCustomValidity(
        /^.{1}$/.test(negativeKey) ? "" : "Invalid key bind!"
      );
      positiveNode.setCustomValidity(
        /^.{1}$/.test(positiveKey) ? "" : "Invalid key bind!"
      );
      console.debug(
        `validity "${positiveNode.checkValidity()}", "${negativeNode.checkValidity()}"`
      );
    }
  }

  /**
   * write keys to storage if keys are valid
   */
  function updateKeys() {
    validateKeys();

    // save keys if valid
    if (positiveNode.checkValidity() && negativeNode.checkValidity()) {
      console.debug(`store keys "${positiveKey}", "${negativeKey}"`);
      storage.set(StorageKey.PositiveKey, positiveKey);
      storage.set(StorageKey.NegativeKey, negativeKey);
    }
  }

  /**
   * get default keys, using iife because no top-level await 😔
   * https://github.com/sveltejs/svelte/issues/5501
   */
  (async function () {
    positiveKey = await storage.get(StorageKey.PositiveKey);
    negativeKey = await storage.get(StorageKey.NegativeKey);
    console.debug(`init get keys "${positiveKey}", "${negativeKey}"`);

    // some key is missing from storage, reset to default
    if (!positiveKey || !negativeKey) {
      console.debug("reset keys");
      positiveKey = "1";
      negativeKey = "0";
      updateKeys();
    }

    validateKeys();
  })();
</script>

<p>Edit your clicking keys!</p>

<div>
  <label for="pos-key">Positive (+1): </label>
  <input
    bind:this={positiveNode}
    bind:value={positiveKey}
    on:input={updateKeys}
    id="pos-key"
    name="pos-key"
    type="text"
    minlength="1"
    maxlength="1"
    pattern={"^.{1}$"}
    required
  />
  <span class="validity" />
</div>

<div>
  <label for="neg-key">Negative (-1): </label>
  <input
    bind:this={negativeNode}
    bind:value={negativeKey}
    on:input={updateKeys}
    id="neg-key"
    name="neg-key"
    type="text"
    minlength="1"
    maxlength="1"
    pattern={"^.{1}$"}
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
