import App from './App'
import Class from './Class'
import style from "./style.css"
import netlifyIdentity from "netlify-identity-widget"

const enableApp = async () => {
    let app = new App(document.querySelector('#app'))

        // app.addClass(new Class("cse325"))
    
        // console.log(app)
    
        await app.import()
    
        app.showClasses()
    
        app.showSummary()
}

window.addEventListener('load', async () => {

    
    netlifyIdentity.init({
        locale: 'en' // defaults to 'en'
    });

    
    

    // Close the modal
    // netlifyIdentity.close();

    const user = netlifyIdentity.currentUser();

    if(user) {
        enableApp()
    } else {
        
        netlifyIdentity.open();
        netlifyIdentity.on("login", (user) => enableApp())
    }

    
})
