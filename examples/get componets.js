if (window.$nuxt) {
    const registeredComponents = window.$nuxt.$options.components;
    const componentName = 'YourComponentName'; // Replace with the actual component name

    // Make sure the component exists
    if (registeredComponents[componentName]) {
        // Create an instance of the component
        const ComponentConstructor = window.$nuxt.extend(registeredComponents[componentName]);
        const componentInstance = new ComponentConstructor();

        // Mount the component to a new element
        const targetElement = document.createElement('div');
        document.body.appendChild(targetElement); // Append it to the body or any other element
        componentInstance.$mount(targetElement);
    } else {
        console.log("Component not found:", componentName);
    }
}
