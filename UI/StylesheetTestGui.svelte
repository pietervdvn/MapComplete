<script lang="ts">


</script>

<div>

    <h1> Stylesheet testing grounds </h1>

    This document exists to explore the style hierarchy.

    <div class="normal-background">
        <h2>Normal background</h2>
        There are a few styles, such as the <span class="literal-code">normal-background</span>-style which is used if there is
        nothing special going on. Some general information, with at most <a href="https://example.com" target="_blank">a
        link to someplace</a>.
        <span class="alert">Alert: something went wrong</span>
        <span class="thanks">Thank you! Operation successful</span>
    </div>

    <div class="low-interaction flex flex-col">
        <h2>Low interaction</h2>
        <p>
            There are <span class="literal-code">low-interaction</span> areas, where some buttons might appear.
        </p>

        <button class="btn">Main action</button>
        <button class="btn-secondary">Secondary action</button>
        <button class="btn-disabled">Disabled</button>
        <input type="text">

        <div>
            <input id="html" name="fav_language" type="radio" value="HTML">
            <label for="html">HTML</label><br>
            <input id="css" name="fav_language" type="radio" value="CSS">
            <label for="css">CSS</label><br>
            <input id="javascript" name="fav_language" type="radio" value="JavaScript">
            <label for="javascript">JavaScript</label>
        </div>

        <span class="alert">Alert: something went wrong</span>
        <span class="thanks">Thank you! Operation successful</span>
    </div>

    <div class="interactive flex flex-col">
        <h2>Interactive area</h2>
        <p>
            There are <span class="literal-code">interactive</span> areas, where some buttons might appear.
        </p>

        <button class="btn">Main action</button>
        <button class="btn-secondary">Secondary action</button>
        <button class="btn-disabled">Disabled</button>
        <span class="alert">Alert: something went wrong</span>
        <span class="thanks">Thank you! Operation successful</span>
    </div>

</div>
