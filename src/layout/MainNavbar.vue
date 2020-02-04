<template>
  <navbar
    position="fixed"
    :transparent="transparent"
    :color-on-scroll="colorOnScroll"
    menu-classes="ml-auto"
  >
    <template slot-scope="{ toggle, isToggled }">
      <router-link v-popover:popover1 class="navbar-brand" to="/presentation"
        >GODANK GAMING</router-link
      >
      <el-popover
        ref="popover1"
        popper-class="popover"
        placement="bottom"
        width="200"
        trigger="hover"
      >
        <div class="popover-body">
          Designed by Invision. Coded by Creative Tim
        </div>
      </el-popover>
    </template>
    <template slot="navbar-menu">
      <router-link v-popover:popover1 class="navbar-brand" to="/presentation"
        >หน้าแรก</router-link
      >
      <router-link
        v-popover:popover1
        class="navbar-brand"
        icon="now-ui-icons tech_laptop"
        to="/presentation"
        >สินค้าใหม่!</router-link
      >
      <router-link v-popover:popover1 class="navbar-brand" to="/presentation"
        >สินค้าทั้งหมด</router-link
      >

      <drop-down
        tag="li"
        title="Examples"
        icon="now-ui-icons design_image"
        class="nav-item"
      >
        <nav-link to="/about">
          <i class="now-ui-icons business_bulb-63"></i> About-us
        </nav-link>
        <nav-link to="/blog-post">
          <i class="now-ui-icons text_align-left"></i> Blog Post
        </nav-link>
        <nav-link class="dropdown-item" to="/blog-posts">
          <i class="now-ui-icons design_bullet-list-67"></i> Blog Posts
        </nav-link>
        <nav-link class="dropdown-item" to="/contact">
          <i class="now-ui-icons location_pin"></i> Contact Us
        </nav-link>
        <nav-link class="dropdown-item" to="/landing">
          <i class="now-ui-icons education_paper"></i> Landing Page
        </nav-link>
        <nav-link class="dropdown-item" to="/login">
          <i class="now-ui-icons users_circle-08"></i> Login Page
        </nav-link>
        <nav-link class="dropdown-item" to="/pricing">
          <i class="now-ui-icons business_money-coins"></i> Pricing
        </nav-link>
        <nav-link class="dropdown-item" to="/ecommerce">
          <i class="now-ui-icons shopping_shop"></i> Ecommerce Page
        </nav-link>
        <nav-link class="dropdown-item" to="/product">
          <i class="now-ui-icons shopping_bag-16"></i> Product Page
        </nav-link>
        <nav-link class="dropdown-item" to="/profile">
          <i class="now-ui-icons users_single-02"></i> Profile Page
        </nav-link>
        <nav-link class="dropdown-item" to="/signup">
          <i class="now-ui-icons tech_mobile"></i> Signup Page
        </nav-link>
      </drop-down>
      <li class="nav-item">
        <a class="nav-link btn btn-primary" target="_blank">
          <p>Login</p>
        </a>
      </li>
    </template>
  </navbar>
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

<style scoped></style>
