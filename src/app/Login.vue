<template>
  <div class="row">
    <div class="col-12">
      <fg-input
        class="no-border form-control-lg"
        placeholder="First Name..."
        addon-left-icon="now-ui-icons users_circle-08"
      ></fg-input>
    </div>
    <div class="col-12">
      <fg-input
        class="no-border form-control-lg"
        placeholder="Last Name..."
        addon-left-icon="now-ui-icons text_caps-small"
      ></fg-input>
    </div>
  </div>
</template>

<script>
import { DropDown, NavbarToggleButton, Navbar, NavLink } from "@/components";
import { Popover } from "element-ui";
export default {
  name: "main-navbar",
  props: {
    transparent: Boolean,
    colorOnScroll: Number
  },
  components: {
    DropDown,
    Navbar,
    NavbarToggleButton,
    NavLink,
    [Popover.name]: Popover
  }
};
</script>

<style scoped>
</style>
