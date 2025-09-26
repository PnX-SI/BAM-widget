<script setup>
    import 'leaflet/dist/leaflet.css';
    import Parameters from '@/components/core/Parameters.vue';
    import Intro from './core/Intro.vue';
    import ParameterStore from '@/lib/parameterStore';
    import HeaderNav from './commons/HeaderNav.vue';
    import { WIDGET_TYPE } from '@/lib/enums';

    const { widgetType } = ParameterStore.getInstance();
</script>

<template>
    <BNavbar
        v-b-color-mode="'dark'"
        toggleable="lg"
        variant="success"
        class="mb-3"
    >
        <BNavbarBrand>🐛 🐦 🌱 {{ $t('discover.title') }}</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
            <BNavbarNav class="ms-auto mb-2 mb-lg-0">
                <BNavForm class="d-flex" right>
                    <LanguageSwitch></LanguageSwitch>
                </BNavForm>
                <BNavItem href="https://pnx-si.github.io/widget-gtsi/docs/#/"
                    ><i class="bi bi-file-text-fill"></i>
                    Documentation</BNavItem
                >
            </BNavbarNav>
        </BCollapse>
    </BNavbar>
    <!-- App -->
    <main class="container-fluid">
        <div class="row">
            <!-- Intro & Parameters -->
            <div class="col-sm-3">
                <Intro></Intro>
                <ShareButton class="margin-top:1em"></ShareButton>
            </div>
            <div class="col-sm-9">
                <ListWidget
                    height="70vh"
                    v-if="widgetType == WIDGET_TYPE.list"
                ></ListWidget>
                <MapListWidget height="90vh" v-else></MapListWidget>
            </div>
        </div>
    </main>
</template>

<script type="module"></script>

<style scoped>
    .row > div {
        max-height: 83vh;
    }
    #preview {
        padding-top: 0.5em;
        background-color: #efefef;
        border-radius: 10px;
        margin-right: 0.5em;
        height: 82.5vh;

        h3 {
            /* color: #666; */
            width: max-content;
            padding: 0.3em;
            border-radius: 10px;
        }
    }
    @media screen and (max-width: 770px) {
        #preview {
            margin-top: 4em;
            margin-left: 0.5em;
        }
    }
</style>
