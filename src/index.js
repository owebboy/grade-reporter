import App from './App'
import Class from './Class'
import style from "./style.css"
import netlifyIdentity from "netlify-identity-widget"

window.addEventListener('load', async () => {

    
    netlifyIdentity.init({
        locale: 'en' // defaults to 'en'
    });

    netlifyIdentity.open(); // open the modal
    netlifyIdentity.on('login', user => console.log('login', user));

    // Close the modal
    // netlifyIdentity.close();

    const user = netlifyIdentity.currentUser();

    if(user) {
        let app = new App(document.querySelector('#app'))

        // app.addClass(new Class("cse325"))
    
        // console.log(app)
    
        await app.import()
    
        app.showClasses()
    
        app.showSummary()
    }

    
})
