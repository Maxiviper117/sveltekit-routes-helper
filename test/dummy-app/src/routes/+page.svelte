<script lang="ts">
    import { routes } from "../lib/appRoutes.js";

    const url1 = routes('/user/[id]/post/[post_id]', { 
        id: "1",
        post_id: "2"
     });
</script>

<main>
    <h1>Home Page</h1>
    <p>Welcome to the home page!</p>
</main>

<style>
    /* ...existing code... */
</style>
