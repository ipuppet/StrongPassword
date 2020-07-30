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
            this.password['name'] = name
            let status = this.kernel.storage.save(this.password)
            if (status) {
                $ui.success($l10n("SAVE_SUCCESS"))
                if ($prefs.get("settings.general.auto_reset_name_input")) {
                    $("password_name").text = ''
                }
            } else {
                $ui.error($l10n("SAVE_ERROR"))
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

    display_password() {
        // 显示密码
        $("password").title = this.password.password
        $("password").hidden = false
        // 显示输入框以及保存按钮
        $("password_name").hidden = false
        $("password_save").hidden = false
        // 显示提示
        $("click_to_copy").hidden = false
        $("password_name_tips").hidden = false
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
            this.display_password()
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
                    events: {
                        changed: (sender) => {
                            this.search(sender.text)
                        },
                        returned: (sender) => {
                            this.search(sender.text)
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
}