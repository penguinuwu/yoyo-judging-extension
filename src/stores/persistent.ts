/**
 * TODO: persistent stores
 *
 * note: i think async is required because
 * we cannot directly use localStorage in the popup and content scripts,
 * so we (probably) need to use the browser.storage API (which returns a Promise)
 * but i cant find an easy way to use async so i give up for now 💀👍
 *
 * perhaps explore https://github.com/square/svelte-store
 */
