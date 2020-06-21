import Grade from './Grade'

export default class Class {
    constructor(name) {
        this.name = name
        this.types = {}
        this.grades = []
    }

    getGrades() {
        return this.grades.map(grade => grade.toJSON())
    }

    addGrade(name, type, grade, total) {
        this.grades.push(new Grade(name, type, grade, total))
    }

    removeGrade(name) {
        let idx = this.grades.findIndex(elem => elem.name == name)

        if (idx < 0) {
            throw Error('unable to delete. name not found')
        }

        this.grades.splice(idx, 1)
    }

    addType(type, weight) {
        this.types[type] = weight
    }

    removeType(type) {
        delete this.types[type]
    }

    calculateGrade() {
        if (this.grades.length < 1) {
            return [NaN, NaN, NaN]
        }

        let pointsEarned = this.grades.reduce(
            (acc, grade) => acc + grade.grade,
            0
        )
        let pointsPossible = this.grades.reduce(
            (acc, grade) => acc + grade.total,
            0
        )

        let totalGrade = NaN
        if (!Number.isNaN(pointsEarned / pointsPossible)) {
            totalGrade = Number.parseFloat(
                (pointsEarned / pointsPossible) * 100
            ).toPrecision(4)
        }

        return [pointsEarned, pointsPossible, `${totalGrade}%`]
    }

    getGrade() {
        return this.calculateGrade()[2]
    }

    getWeighted() {
        if (this.grades.length < 1) {
            return NaN
        }

        let pointsEarned = this.grades.reduce(
            (acc, grade) => acc + grade.grade * this.types[grade.type],
            0
        )
        let pointsPossible = this.grades.reduce(
            (acc, grade) => acc + grade.total * this.types[grade.type],
            0
        )

        let totalGrade = NaN
        if (!Number.isNaN(pointsEarned / pointsPossible)) {
            totalGrade = Number.parseFloat(
                (pointsEarned / pointsPossible) * 100
            ).toPrecision(4)
        }

        return `${totalGrade}%`
    }
}
