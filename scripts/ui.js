class UI {
    constructor(kernel) {
        this.kernel = kernel
        this.password = null
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

    save_action(password) {
        let status = this.kernel.storage.save(password)
        if (status) {
            $ui.success($l10n("SAVE_SUCCESS"))
            if ($prefs.get("settings.general.auto_reset_name_input")) {
                $("password_name").text = ''
            }
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
        return status
    }

    save() {
        let name = $("password_name").text.trim()
        if (name === '') {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_PASSWORD_NAME"),
            })
            return
        }
        this.password['name'] = name
        if (this.kernel.storage.has(name)) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("ALREADY_SAVED_PASSWORD"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            this.save_action(this.password)
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        } else {
            this.save_action(this.password)
        }
    }

    save_by_user() {
        let name = $("password_name_by_user").text.trim()
        if (name === '') {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_PASSWORD_NAME"),
            })
            return
        }
        let password = {
            name: name,
            password: $("password_by_user").text,
            date: new Date().toLocaleDateString()
        }
        let status = false
        if (this.kernel.storage.has(name)) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("ALREADY_SAVED_PASSWORD"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            status = this.save_action(password)
                        }
                    },
                    {
                        title: $l10n("CANCEL")
                    }
                ]
            })
        } else {
            status = this.save_action(password)
        }
        return status
    }

    generate_button_handler() {
        if (this.password === null) {
            if ($prefs.get("settings.general.auto_reset_name_input")) {
                $("password_name").text = ''
            }
            this.password = {
                password: this.kernel.generate_strong_password(),
                date: new Date().toLocaleDateString()
            }
            // 显示密码
            $("password").title = this.password.password
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

    search(name) {
        let data = this.kernel.storage.search(name)
        if (data.length > 0) {
            $("password_list").data = this.all_data_to_ui(data)
        } else {
            $("password_list").data = [{
                list_password: {
                    text: ""
                },
                list_name: {
                    text: ""
                },
                list_date: {
                    text: ""
                },
                no_result: {
                    text: $l10n("NO_RESULT")
                }
            }]
        }
    }

    all_data_to_ui(data) {
        function get_label(password) {
            return {
                list_password: {
                    text: password.password
                },
                list_name: {
                    text: password.name
                },
                list_date: {
                    text: password.date
                },
                no_result: {
                    text: ""
                }
            }
        }
        if (this.all_data !== false) {
            let result = []
            for (let password of data) {
                result.push(get_label(password))
            }
            return result
        }
    }

    ui_storage() {
        $ui.push({
            props: {
                id: "storage",
                title: $l10n("PASSWORD_STORAGE"),
                navButtons: [
                    {
                        title: $l10n("ADD"),
                        image: $image("assets/icon/add.png"),
                        handler: (sender) => {
                            let popover = $ui.popover({
                                sourceView: sender,
                                sourceRect: sender.bounds,
                                directions: $popoverDirection.any,
                                size: $size(320, 200),
                                views: [
                                    {
                                        type: "label",
                                        props: {
                                            text: $l10n("ADD_BY_USER"),
                                            align: $align.left,
                                            line: 1,
                                            font: $font(16),
                                            textColor: $color({
                                                light: "#ADADAD",
                                                dark: "#DDDDDD"
                                            })
                                        },
                                        layout: (make, view) => {
                                            make.left.right.inset(5)
                                            make.top.equalTo(20)
                                        }
                                    },
                                    {
                                        type: "input",
                                        props: {
                                            id: "password_by_user",
                                            type: $kbType.search,
                                            placeholder: $l10n("PASSWORD_BY_USER"),
                                        },
                                        layout: (make, view) => {
                                            make.left.right.inset(5)
                                            make.top.equalTo(50)
                                            make.height.equalTo(40)
                                        }
                                    },
                                    {
                                        type: "input",
                                        props: {
                                            id: "password_name_by_user",
                                            type: $kbType.search,
                                            placeholder: $l10n("PASSWORD_NAME"),
                                        },
                                        layout: (make, view) => {
                                            make.left.right.inset(5)
                                            make.top.equalTo(105)
                                            make.height.equalTo(40)
                                        }
                                    },
                                    {
                                        type: "button",
                                        props: {
                                            title: $l10n("SAVE_BUTTON"),
                                            contentEdgeInsets: 10,
                                        },
                                        layout: (make, view) => {
                                            make.left.right.inset(5)
                                            make.bottom.inset(10)
                                        },
                                        events: {
                                            tapped: sender => {
                                                if (this.save_by_user()) {
                                                    setTimeout(() => {
                                                        popover.dismiss()
                                                        $("password_list").data = this.all_data_to_ui(this.kernel.storage.all())
                                                    }, 1000)
                                                }
                                            }
                                        }
                                    }
                                ]
                            })
                        }
                    }
                ],
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
                    events: {
                        changed: (sender) => {
                            this.search(sender.text.trim())
                        },
                        returned: (sender) => {
                            this.search(sender.text.trim()),
                                sender.blur()
                        }
                    }
                },
                {
                    type: "list",
                    props: {
                        id: "password_list",
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
                        data: this.all_data_to_ui(this.kernel.storage.all()),
                        actions: [
                            {
                                title: $l10n("DELETE"),
                                color: $color("red"),
                                handler: (sender, indexPath) => {
                                    let delete_action = () => {
                                        let keys = this.kernel.storage.keys()
                                        if (this.kernel.storage.delete(keys[indexPath.item])) {
                                            sender.delete(indexPath)
                                            $ui.success($l10n("DELETE_SUCCESS"))
                                        } else {
                                            $ui.error($l10n("DELETE_ERROR"))
                                        }
                                    }
                                    if ($prefs.get("settings.general.delete_confirm")) {
                                        $ui.alert({
                                            title: $l10n("ALERT_INFO"),
                                            message: $l10n("CONFIRM_DELETE_MSG"),
                                            actions: [
                                                {
                                                    title: $l10n("OK"),
                                                    handler: () => {
                                                        delete_action()
                                                    }
                                                },
                                                {
                                                    title: $l10n("CANCEL")
                                                }
                                            ]
                                        })
                                    } else {
                                        delete_action()
                                    }
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
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "no_result",
                                        align: $align.center
                                    },
                                    layout: (make, view) => {
                                        make.left.right.inset(5)
                                        make.top.inset(15)
                                    }
                                }
                            ]
                        }
                    },
                    events: {
                        didSelect: (sender, indexPath, data) => {
                            if (data.no_result.text.trim() !== $l10n("NO_RESULT"))
                                this.copy_password({ password: data.list_password.text.trim() })
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
                        image: $image("assets/icon/storage.png"),
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
                        make.height.equalTo(40)
                        make.top.inset(40)
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
                        text: $l10n("CLICK_TO_COPY"),
                        align: $align.left,
                        line: 1,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.inset(10)
                        make.top.equalTo($("password").top).offset(40)
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "password_name",
                        type: $kbType.search,
                        placeholder: $l10n("PASSWORD_NAME"),
                    },
                    layout: (make, view) => {
                        make.right.inset(80)
                        make.left.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo($("password").top).offset(40 + 40)
                    },
                    events: {
                        returned: sender => {
                            this.save()
                            sender.blur()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        text: $l10n("PASSWORD_NAME_TIPS"),
                        align: $align.left,
                        line: 1,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        })
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.top.equalTo($("password").top).offset(40 + 40 + 40)
                    }
                },
                {
                    type: "button",
                    props: {
                        title: $l10n("SAVE_BUTTON"),
                        contentEdgeInsets: 10,
                    },
                    layout: (make, view) => {
                        make.right.inset(10)
                        make.height.equalTo(40)
                        make.width.equalTo(60)
                        make.top.equalTo($("password").top).offset(40 + 40)
                    },
                    events: {
                        tapped: sender => {
                            this.save()
                            $("password_name").blur()
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
                        make.bottom.equalTo(-50)
                    },
                    events: {
                        tapped: sender => {
                            this.generate_button_handler()
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
}