function strMapToObj(strMap) {
    let obj = Object.create(null)
    for (let [k, v] of strMap) {
        obj[k] = v
    }
    return obj
}

function objToStrMap(obj) {
    let strMap = new Map()
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k])
    }
    return strMap
}

function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap))
}

function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr))
}

function to_new() {
    let path = "assets/StrongPassword.txt"
    if ($file.exists(path)) {
        let file_content = $file.read(path).string
        if (file_content.substring(0, 3) !== "END") {
            let old_data = jsonToStrMap(file_content)
            let storage = new Storage()
            for (let [name, password] of old_data) {
                password['name'] = name
                storage.save(password)
            }
            $file.write({
                data: $data({ string: "END\n" + file_content }),
                path: path
            })
            return
        }
    }
    $ui.alert({
        title: $l10n("ALERT_INFO"),
        message: "没有数据需要迁移",
    })
}

class Storage {
    constructor() {
        this.sqlite = $sqlite.open("assets/StrongPassword.db")
        this.sqlite.update("CREATE TABLE IF NOT EXISTS password_storage(name text, password text,date text)")
    }

    parse(result) {
        if (result.error !== null) {
            $console.error(result.error)
            return false
        }
        let data = []
        while (result.result.next()) {
            data.push({
                name: result.result.get('name'),
                password: result.result.get('password'),
                date: result.result.get('date'),
            })
        }
        // result.result.close()
        return data
    }

    get(name) {
        let result = this.sqlite.query({
            sql: "SELECT * FROM password_storage where name = ?",
            args: [name]
        })
        let data = this.parse(result)
        return data.length === 0 ? null : data[0]
    }

    all() {
        let result = this.sqlite.query("SELECT * FROM password_storage")
        return this.parse(result)
    }

    keys() {
        let result = this.sqlite.query("SELECT name FROM password_storage")
        let data = []
        for (let name of this.parse(result)) {
            data.push(name.name)
        }
        return data
    }

    has(name) {
        return this.get(name) === null ? false : true
    }

    search(name) {

    }

    save(password) {
        let result = null
        if (this.has(password.name)) {
            result = this.sqlite.update({
                sql: "UPDATE password_storage SET password = ?, date = ? WHERE name = ?",
                args: [password.password, password.date, password.name]
            })
        } else {
            result = this.sqlite.update({
                sql: "INSERT INTO password_storage (name, password, date) values(?, ?, ?)",
                args: [password.name, password.password, password.date]
            })
        }
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }

    delete(name) {
        let result = this.sqlite.update({
            sql: "DELETE FROM password_storage where name = ?",
            args: [name]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }
}

module.exports = {
    Storage: Storage,
    to_new: to_new
}