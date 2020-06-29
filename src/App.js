import PouchDB from 'pouchdb'
import Class from './Class'

export default class App {
    constructor(dom) {
        this.db = new PouchDB('grades')
        this.remoteDB = new PouchDB(`https://admin:fibonacci@sike.dev/couchdb/grades`)

        // replicate the DB to start
        this.db.replicate.to(this.remoteDB).then(result => {
            // handle 'completed' result
            console.log(result)
          }).catch(err => {
            console.log(err);
          });

        // set up sync
        this.db.sync(this.remoteDB, {
            live: true,
            retry: true
          }).on('change', function (change) {
              console.log("CHANGE", change)
          }).on('paused', function (info) {
            console.log("PAUSED", info)
        }).on('active', function (info) {
            console.log("ACTIVE", info)
        }).on('error', function (err) {
            console.log("ERROR", err)
        });

        this.classes = []
        this.dom = dom
        this.actions = document.querySelector('.actions')
    }

    showClasses() {
        this.actions.innerHTML = ''
        let classes = document.createElement('div')

        classes.classList.add('classes')

        let summary = document.createElement('button')
        summary.addEventListener('click', e => this.showSummary())
        summary.textContent = 'summary'
        classes.append(summary)

        this.classes.forEach(elem => {
            let _class = document.createElement('button')
            _class.addEventListener('click', e => this.showClass(elem))
            _class.textContent = elem.name
            classes.append(_class)
        })

        this.actions.append(classes)
    }

    showClass(_class) {
        this.dom.innerHTML = ''

        this.showAddTypesForm(_class)
        this.showAddGradeForm(_class)

        let c = document.createElement('div')
        c.classList.add('class')

        let header = document.createElement('h2')
        header.textContent = _class.name
        c.append(header)

        let table = document.createElement('table')

        let thead = document.createElement('thead')
        thead.innerHTML = `
        
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Grade</th>
            <th>Total</th>
            <th>%</th>
        </tr>

        `
        table.append(thead)

        let tbody = document.createElement('tbody')

        if (_class.grades.length < 1) {
            tbody.innerHTML =
                '<tr><td colspan=5>No assignments reported!</td></tr>'
        } else {
            _class.grades.forEach(grade => {
                let tr = document.createElement('tr')
                tr.addEventListener('click', e => {
                    console.log(e)
                    if (
                        window.confirm(
                            `Delete grade ${grade.name} from class ${_class.name}?`
                        )
                    ) {
                        _class.removeGrade(grade.name)
                        this.updateClass(_class)
                    }
                })

                tr.innerHTML = `
            <td>${grade.name}</td>
            <td>${grade.type}</td>
            <td>${grade.grade}</td>
            <td>${grade.total}</td>
            <td>${grade.getPercent()}</td>
            
            `

                tbody.append(tr)
            })
        }
        table.append(tbody)

        let tfoot = document.createElement('tfoot')

        tfoot.innerHTML += `
        <tr>
            <th>Grade</th>
            <td colspan=4>${
                Number.isNaN(_class.getGrade()) ? '-' : _class.getGrade()
            }</td>
        </tr>
        <tr>
            <th>Weighted Grade</th>
            <td colspan=4>${
                Number.isNaN(_class.getWeighted()) ? '-' : _class.getWeighted()
            }</td>
        </tr>
        `

        table.append(tfoot)

        c.append(table)

        this.dom.append(c)
    }

    showSummary() {
        this.dom.innerHTML = ''
        this.showAddClassForm()
        let classes = document.createElement('table')
        let thead = `
    <thead>
        <tr>
            <th>Index</th>
            <th>Class</th>
            <th>Points Earned</th>
            <th>Points Possible</th>
            <th>Grade</th>
        </tr>
    </thead>`
        classes.innerHTML += thead

        let tbody = document.createElement('tbody')
        for (let i = 0; i < this.classes.length; i++) {
            const element = this.classes[i]
            let [
                pointsEarned,
                pointsPossible,
                totalPercent,
            ] = element.calculateGrade()
            let tr = document.createElement('tr')

            tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${element.name}</td>
            <td>${Number.isNaN(pointsEarned) ? '-' : pointsEarned}</td>
            <td>${Number.isNaN(pointsPossible) ? '-' : pointsPossible}</td>
            <td>${Number.isNaN(totalPercent) ? '-' : totalPercent}</td>`

            tr.addEventListener('click', e => {
                if (window.confirm(`Delete class ${element.name}?`)) {
                    this.removeClass(element)
                }
            })

            tbody.append(tr)
        }

        classes.append(tbody)
        this.dom.append(classes)
    }

    showAddClassForm() {
        let form = document.createElement('form')

        let input = document.createElement('input')
        input.type = 'text'
        input.name = 'name'
        input.placeholder = 'class name'
        form.append(input)

        let submit = document.createElement('input')
        submit.type = 'submit'
        submit.value = 'add class'

        form.append(submit)

        form.addEventListener('submit', e => {
            e.preventDefault()
            this.addClass(input.value)
        })
        this.dom.append(form)
    }

    showAddTypesForm(_class) {
        let form = document.createElement('form')

        let input = document.createElement('input')
        input.type = 'text'
        input.name = 'name'
        input.placeholder = 'name'
        form.append(input)

        let weight = document.createElement('input')
        weight.type = 'number'
        weight.name = 'weight'
        weight.placeholder = 'weight'
        weight.step = 0.01
        form.append(weight)

        let submit = document.createElement('input')
        submit.type = 'submit'
        submit.value = 'add type'
        form.append(submit)

        form.addEventListener('submit', e => {
            e.preventDefault()

            _class.addType(input.value, weight.valueAsNumber)

            this.updateClass(_class)
        })
        this.dom.append(form)
    }

    showAddGradeForm(_class) {
        if (Object.keys(_class.types).length < 1) {
            return
        }
        let form = document.createElement('form')

        let input = document.createElement('input')
        input.type = 'text'
        input.name = 'name'
        input.placeholder = 'assignment name'
        form.append(input)

        let typesSelect = document.createElement('select')
        typesSelect.name = 'types'

        Object.keys(_class.types).forEach(type => {
            let option = document.createElement('option')

            option.textContent = type

            typesSelect.append(option)
        })

        form.append(typesSelect)

        let grade = document.createElement('input')
        grade.type = 'number'
        grade.name = 'grade'
        grade.placeholder = 'grade'
        grade.max = 1000
        form.append(grade)

        form.append(document.createTextNode(' / '))

        let total = document.createElement('input')
        total.type = 'number'
        total.name = 'total'
        total.placeholder = 'total'
        total.max = 1000
        form.append(total)

        let submit = document.createElement('input')
        submit.type = 'submit'
        submit.value = 'add grade'

        form.append(submit)

        form.addEventListener('submit', e => {
            e.preventDefault()

            _class.addGrade(
                input.value,
                typesSelect.value,
                grade.valueAsNumber,
                total.valueAsNumber
            )

            this.updateClass(_class)
        })
        this.dom.append(form)
    }

    async addClass(name) {
        let _class = new Class(name)
        try {
            let resp = await this.db.put({
                _id: _class.name,
                grades: _class.getGrades(),
                types: _class.types,
            })

            this.classes.push(_class)
            this.showClasses()
            this.showSummary()
        } catch (err) {
            console.error(err)
        }
    }

    async updateClass(_class) {
        try {
            let doc = await this.db.get(_class.name)
            let resp = await this.db.put({
                _id: _class.name,
                _rev: doc._rev,
                grades: _class.getGrades(),
                types: _class.types,
            })

            this.showClass(_class)
        } catch (err) {
            console.error(err)
        }
    }

    async removeClass(_class) {
        try {
            var doc = await this.db.get(_class.name)
            var response = await this.db.remove(doc)

            let idx = this.classes.findIndex(elem => elem.name == _class.name)

            this.classes.splice(idx, 1)
            this.showClasses()
            this.showSummary()
        } catch (err) {
            console.error(err)
        }
    }

    // get users grades
    async import() {
        try {
            let result = await this.db.allDocs({
                include_docs: true,
                attachments: true,
            })

            //   use result
            let classes = []
            result.rows.forEach(row => {
                let _class = new Class(row.id)

                _class.types = row.doc.types
                row.doc.grades.forEach(e => {
                    _class.addGrade(e.name, e.type, e.grade, e.total)
                })

                classes.push(_class)
            })
            this.classes = classes
        } catch (err) {
            console.error(err)
        }
    }
}
