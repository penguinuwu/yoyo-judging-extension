<script lang="ts">
  import { Storage } from "@plasmohq/storage";

  import { StorageKey } from "~lib/constants";
  import { consoleDebug } from "~lib/utils";

  const storage = new Storage();

  let positiveNode: HTMLInputElement = undefined;
  let negativeNode: HTMLInputElement = undefined;
  let positiveKey: string = undefined;
  let negativeKey: string = undefined;

  // watch for key binding changes
  storage.watch({
    [StorageKey.KeyPositive]: (c) => {
      consoleDebug(`positiveKey: ${c.newValue}`);
      positiveKey = c.newValue;
      validateKeys();
    },
    [StorageKey.KeyNegative]: (c) => {
      consoleDebug(`negativeKey: ${c.newValue}`);
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
      consoleDebug(`duplicate key binds "${positiveKey}", "${negativeKey}"`);
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
      consoleDebug(
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
      consoleDebug(`store keys "${positiveKey}", "${negativeKey}"`);
      storage.set(StorageKey.KeyPositive, positiveKey);
      storage.set(StorageKey.KeyNegative, negativeKey);
    }
  }

  /**
   * get default keys, using iife because no top-level await 😔
   * https://github.com/sveltejs/svelte/issues/5501
   */
  (async function () {
    positiveKey = await storage.get(StorageKey.KeyPositive);
    negativeKey = await storage.get(StorageKey.KeyNegative);
    consoleDebug(`init get keys "${positiveKey}", "${negativeKey}"`);

    // some key is missing from storage, reset to default
    if (!positiveKey || !negativeKey) {
      consoleDebug("reset keys");
      positiveKey = "1";
      negativeKey = "0";
      updateKeys();
    }

    validateKeys();
  })();
</script>

<header>
  <h1>Yo-Yo Judging Helper</h1>
</header>

<main>
  <section>
    <h2>Clicking keyboard shortcuts:</h2>

    <div class="label-input">
      <label for="pos-key">Positive click (score +1): </label>
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

    <div class="label-input">
      <label for="neg-key">Negative click (score -1): </label>
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
  </section>
</main>

<footer>
  Any problems? Please submit an issue on <a
    href="https://github.com/penguinuwu/yoyo-judging-extension/"
    target="_blank"
    rel="noopener noreferrer">Github</a
  > 🩷
</footer>

<style>
  :global(html) {
    min-height: 13em;
    min-width: 20em;
  }
  :global(body) {
    background: #282b30;
    color: whitesmoke;
    margin: 1em;
  }

  header {
    text-align: center;
  }

  main {
    margin: 0 0 0 1em;
  }
  .label-input {
    /* margin: 0 1em 0.3em 1em; */
    margin-bottom: 0.3em;
  }
  label:hover {
    cursor: text;
  }
  input {
    width: 2em;
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

  a {
    color: paleturquoise;
  }
  a:hover {
    text-decoration: none;
  }
  footer {
    margin: 2em auto 0 auto;
    margin-top: 2em;
    text-align: center;
  }
</style>
