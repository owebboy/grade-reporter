export default class Grade {
    constructor(name, type, grade, total) {
        this.name = name
        this.grade = grade
        this.total = total
        this.type = type
    }

    toJSON() {
        return {
            name: this.name,
            grade: this.grade,
            total: this.total,
            type: this.type,
        }
    }

    getPercent() {
        return `${(this.grade / this.total) * 100}%`
    }
}
