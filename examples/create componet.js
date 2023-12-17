// Step 1: Create a Simple Vue Component
const MyNewComponent = {
    template: `<div>{{ message }}</div>`,
    data() {
      return {
        message: 'Hello from the new component!'
      };
    }
  };
  
  // Step 2: Register the Component
  // Assuming $nuxt is available in the window object
  window.$nuxt.$options.components['MyNewComponent'] = MyNewComponent;
  
  // Step 3: Locate the Right Spot in the DOM
  // This is just an example, you should find an element that suits your needs
  const targetElement = document.querySelector('#someElementId'); // Replace with your target element's selector
  
  // Step 4: Mount the Component
  if (targetElement) {
    // Create a new Vue instance and mount it
    const ComponentConstructor = window.$nuxt.$options.components['MyNewComponent'];
    const instance = new ComponentConstructor();
    instance.$mount();
  
    // Append the component to the target element
    targetElement.appendChild(instance.$el);
  }
  