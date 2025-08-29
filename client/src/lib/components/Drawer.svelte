<script lang="ts">
  let { isOpen, children } = $props<{
    isOpen: boolean;
    children: svelte.Snippet;
  }>();
</script>

<div class="drawer" class:open={isOpen}>
  <div class="drawer-content">
    {@render children()}
  </div>
</div>

<style>
  @reference "../../app.css";

  .drawer {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows 250ms;
  }

  .drawer.open {
    grid-template-rows: 1fr;
  }

  .drawer .drawer-content {
    min-height: 0;
    transition:
      visibility 250ms,
      opacity 250ms,
      padding 250ms;
    visibility: hidden;
    overflow: hidden;
  }

  .drawer:not(.open) .drawer-content {
    opacity: 0;
    padding: 0;
  }

  .drawer.open .drawer-content {
    visibility: visible;
    opacity: 1;
  }
</style>
