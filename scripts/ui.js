<<<<<<< HEAD
class UI {
    kernel = null
    password = null

    constructor(kernel) {
        this.kernel = kernel
    }

    copy_password(password = null) {
        if (password === null) {
            password = this.password
        }
        if (password !== null) {
            $clipboard.text = password.password
            $ui.toast($l10n("COPY"))
        }
    }

    save() {
        let name = $("password_name").text
        if (name === '') {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_PASSWORD_NAME"),
            })
            return
        }
        let save_action = () => {
            let status = this.kernel.storage.save(name, this.password)
            console.log(status)
            if (status) {
                $ui.success($l10n("SAVE_SUCCESS"))
                if ($prefs.get("settings.general.auto_reset_name_input")) {
                    $("password_name").text = ''
                }
            }
        }
        if (this.kernel.storage.has(name)) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("ALREADY_SAVED_PASSWORD"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            save_action()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        } else {
            save_action()
        }
    }

    generate_button_handler() {
        if (this.password === null) {
            if ($prefs.get("settings.general.auto_reset_name_input")) {
                $("password_name").text = ''
            }
            let password = this.kernel.generate_strong_password()
            let date = new Date()
            this.password = {
                password: password,
                date: date.toLocaleDateString()
            }
            // 显示密码
            $("password").title = password
            $("password").hidden = false
            // 显示输入框以及保存按钮
            $("password_name").hidden = false
            $("password_save").hidden = false
            // 显示提示
            $("click_to_copy").hidden = false
            $("password_name_tips").hidden = false
            // 是否自动复制
            if ($prefs.get("settings.general.auto_copy")) {
                this.copy_password()
            }
        } else {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("PASSWORD_HAS_GENERATED"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            this.password = null
                            this.generate_button_handler()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        }
    }

    ui_storage() {
        $ui.push({
            props: {
                id: "storage",
                title: $l10n("PASSWORD_STORAGE")
            },
            views: [
                {
                    type: "input",
                    props: {
                        placeholder: $l10n("STORAGE_SEARCH"),
                        type: $kbType.search,
                        autoFontSize: true,
                    },
                    layout: (make, view) => {
                        make.height.equalTo(30)
                        make.top.equalTo(10)
                        make.left.right.inset(10)
                    },
                    changed: (sender) => {
                        this.kernel.storage.search(sender)
                    },
                    returned: (sender) => {
                        this.kernel.storage.search(sender)
                    }
                },
                {
                    type: "list",
                    id: "password_list",
                    props: {
                        reorder: false,
                        rowHeight: 50,
                        header: {
                            type: "label",
                            props: {
                                height: 20,
                                text: $l10n("PASSWORD_STORAGE"),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.left,
                                font: $font(12)
                            }
                        },
                        data: this.kernel.storage.all(),
                        actions: [
                            {
                                title: "delete",
                                color: $color("gray"),
                                handler: (sender, indexPath) => {
                                    let keys = this.kernel.storage.keys()
                                    this.kernel.storage.delete(keys[indexPath.item])
                                }
                            }
                        ],
                        template: {
                            props: {},
                            views: [
                                {
                                    type: "label",
                                    props: {
                                        id: "list_password",
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.left.top.inset(5)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "list_name",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.left.bottom.inset(5)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "list_date",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.right
                                    },
                                    layout: (make, view) => {
                                        make.right.bottom.inset(5)
                                    }
                                }
                            ]
                        }
                    },
                    events: {
                        didSelect: (sender, indexPath, data) => {
                            this.copy_password({ password: data.list_password.text })
                        }
                    },
                    layout: (make, view) => {
                        make.top.equalTo(60)
                        make.bottom.equalTo(10)
                        make.left.right.inset(10)
                    },
                }
            ]
        })
    }

    ui_main() {
        $ui.render({
            props: {
                id: "main",
                title: $l10n("STRONG_PASSWORD_APP"),
                navButtons: [
                    {
                        title: $l10n("SETTINGS"),
                        icon: "002",
                        handler: () => {
                            $prefs.open()
                        }
                    },
                    {
                        title: $l10n("PASSWORD_STORAGE"),
                        icon: "109",
                        handler: () => {
                            this.ui_storage()
                        }
                    }
                ],
            },
            views: [
                {
                    type: "button",
                    props: {
                        id: "password",
                        title: "",
                        align: $align.center,
                        editable: false,
                        hidden: true,
                        bgcolor: $color({
                            light: "#eff0f2",
                            dark: "#4B4B4B"
                        }),
                        titleColor: $color({
                            light: "#4B4B4B",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.top.equalTo(60)
                        make.height.equalTo(40)
                    },
                    events: {
                        tapped: sender => {
                            this.copy_password()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        id: "click_to_copy",
                        text: $l10n("CLICK_TO_COPY"),
                        align: $align.left,
                        line: 1,
                        hidden: true,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.inset(10)
                        make.top.equalTo(100)
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "password_name",
                        type: $kbType.search,
                        placeholder: $l10n("PASSWORD_NAME"),
                        hidden: true
                    },
                    layout: (make, view) => {
                        make.width.equalTo(230)
                        make.left.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo(150)
                    },
                    events: {
                        returned: sender => {
                            this.save()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        id: "password_name_tips",
                        text: $l10n("PASSWORD_NAME_TIPS"),
                        align: $align.left,
                        line: 1,
                        hidden: true,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.width.equalTo(230)
                        make.left.inset(10)
                        make.top.equalTo(190)
                    }
                },
                {
                    type: "button",
                    props: {
                        id: "password_save",
                        title: $l10n("SAVE_BUTTON"),
                        contentEdgeInsets: 10,
                        hidden: true
                    },
                    layout: (make, view) => {
                        make.right.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo(150)
                    },
                    events: {
                        tapped: sender => {
                            this.save()
                        }
                    }
                },
                {
                    type: "button",
                    props: {
                        id: "generate_password",
                        title: $l10n("GENERATE_BUTTON"),
                        contentEdgeInsets: 10
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.bottom.equalTo(-100)
                    },
                    events: {
                        tapped: sender => {
                            this.generate_button_handler(sender)
                        }
                    }
                }
            ]
        })
    }

    render() {
        this.ui_main()
    }
}

module.exports = {
    UI: UI
=======
class UI {
    kernel = null
    password = null

    constructor(kernel) {
        this.kernel = kernel
    }

    copy_password(password = null) {
        if (password === null) {
            password = this.password
        }
        if (password !== null) {
            $clipboard.text = password.password
            $ui.toast($l10n("COPY"))
        }
    }

    save() {
        let name = $("password_name").text
        if (name === '') {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_PASSWORD_NAME"),
            })
            return
        }
        let save_action = () => {
            let status = this.kernel.storage.save(name, this.password)
            console.log(status)
            if (status) {
                $ui.success($l10n("SAVE_SUCCESS"))
                if ($prefs.get("settings.general.auto_reset_name_input")) {
                    $("password_name").text = ''
                }
            }
        }
        if (this.kernel.storage.has(name)) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("ALREADY_SAVED_PASSWORD"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            save_action()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        } else {
            save_action()
        }
    }

    generate_button_handler() {
        if (this.password === null) {
            if ($prefs.get("settings.general.auto_reset_name_input")) {
                $("password_name").text = ''
            }
            let password = this.kernel.generate_strong_password()
            let date = new Date()
            this.password = {
                password: password,
                date: date.toLocaleDateString()
            }
            // 显示密码
            $("password").title = password
            $("password").hidden = false
            // 显示输入框以及保存按钮
            $("password_name").hidden = false
            $("password_save").hidden = false
            // 显示提示
            $("click_to_copy").hidden = false
            $("password_name_tips").hidden = false
            // 是否自动复制
            if ($prefs.get("settings.general.auto_copy")) {
                this.copy_password()
            }
        } else {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("PASSWORD_HAS_GENERATED"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            this.password = null
                            this.generate_button_handler()
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        }
    }

    ui_storage() {
        $ui.push({
            props: {
                id: "storage",
                title: $l10n("PASSWORD_STORAGE")
            },
            views: [
                {
                    type: "input",
                    props: {
                        placeholder: $l10n("STORAGE_SEARCH"),
                        type: $kbType.search,
                        autoFontSize: true,
                    },
                    layout: (make, view) => {
                        make.height.equalTo(30)
                        make.top.equalTo(10)
                        make.left.right.inset(10)
                    },
                    changed: (sender) => {
                        this.kernel.storage.search(sender)
                    },
                    returned: (sender) => {
                        this.kernel.storage.search(sender)
                    }
                },
                {
                    type: "list",
                    id: "password_list",
                    props: {
                        reorder: false,
                        rowHeight: 50,
                        header: {
                            type: "label",
                            props: {
                                height: 20,
                                text: $l10n("PASSWORD_STORAGE"),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.left,
                                font: $font(12)
                            }
                        },
                        data: this.kernel.storage.all(),
                        actions: [
                            {
                                title: "delete",
                                color: $color("gray"),
                                handler: (sender, indexPath) => {
                                    let keys = this.kernel.storage.keys()
                                    this.kernel.storage.delete(keys[indexPath.item])
                                }
                            }
                        ],
                        template: {
                            props: {},
                            views: [
                                {
                                    type: "label",
                                    props: {
                                        id: "list_password",
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.left.top.inset(5)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "list_name",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.left.bottom.inset(5)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "list_date",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.right
                                    },
                                    layout: (make, view) => {
                                        make.right.bottom.inset(5)
                                    }
                                }
                            ]
                        }
                    },
                    events: {
                        didSelect: (sender, indexPath, data) => {
                            this.copy_password({ password: data.list_password.text })
                        }
                    },
                    layout: (make, view) => {
                        make.top.equalTo(60)
                        make.bottom.equalTo(10)
                        make.left.right.inset(10)
                    },
                }
            ]
        })
    }

    ui_main() {
        $ui.render({
            props: {
                id: "main",
                title: $l10n("STRONG_PASSWORD_APP"),
                navButtons: [
                    {
                        title: $l10n("SETTINGS"),
                        icon: "002",
                        handler: () => {
                            $prefs.open()
                        }
                    },
                    {
                        title: $l10n("PASSWORD_STORAGE"),
                        icon: "109",
                        handler: () => {
                            this.ui_storage()
                        }
                    }
                ],
            },
            views: [
                {
                    type: "button",
                    props: {
                        id: "password",
                        title: "",
                        align: $align.center,
                        editable: false,
                        hidden: true,
                        bgcolor: $color({
                            light: "#eff0f2",
                            dark: "#4B4B4B"
                        }),
                        titleColor: $color({
                            light: "#4B4B4B",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.top.equalTo(60)
                        make.height.equalTo(40)
                    },
                    events: {
                        tapped: sender => {
                            this.copy_password()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        id: "click_to_copy",
                        text: $l10n("CLICK_TO_COPY"),
                        align: $align.left,
                        line: 1,
                        hidden: true,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.inset(10)
                        make.top.equalTo(100)
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "password_name",
                        type: $kbType.search,
                        placeholder: $l10n("PASSWORD_NAME"),
                        hidden: true
                    },
                    layout: (make, view) => {
                        make.width.equalTo(230)
                        make.left.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo(150)
                    },
                    events: {
                        returned: sender => {
                            this.save()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        id: "password_name_tips",
                        text: $l10n("PASSWORD_NAME_TIPS"),
                        align: $align.left,
                        line: 1,
                        hidden: true,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.width.equalTo(230)
                        make.left.inset(10)
                        make.top.equalTo(190)
                    }
                },
                {
                    type: "button",
                    props: {
                        id: "password_save",
                        title: $l10n("SAVE_BUTTON"),
                        contentEdgeInsets: 10,
                        hidden: true
                    },
                    layout: (make, view) => {
                        make.right.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo(150)
                    },
                    events: {
                        tapped: sender => {
                            this.save()
                        }
                    }
                },
                {
                    type: "button",
                    props: {
                        id: "generate_password",
                        title: $l10n("GENERATE_BUTTON"),
                        contentEdgeInsets: 10
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.bottom.equalTo(-100)
                    },
                    events: {
                        tapped: sender => {
                            this.generate_button_handler(sender)
                        }
                    }
                }
            ]
        })
    }

    render() {
        this.ui_main()
    }
}

module.exports = {
    UI: UI
>>>>>>> 0a1b00b45c83e9fe790ee5c8312707e94c1028fc
}