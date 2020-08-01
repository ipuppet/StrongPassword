class UI {
    constructor(kernel) {
        this.kernel = kernel
        this.password = null
    }

    copy_password(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    save(password, is_update = false) {
        if (password.password === "") {
            $ui.toast($l10n("NO_PASSWORD"))
            return false
        }
        let result = false
        if (is_update) {
            result = this.kernel.storage.update(password)
        } else {
            result = this.kernel.storage.save(password)
        }
        if (result) {
            $ui.success($l10n("SAVE_SUCCESS"))
            $("password_list").data = this.password_list_to_ui(this.kernel.storage.all())
            setTimeout(() => {
                $ui.pop()
            }, 500)
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
    }

    generate_button_handler() {
        if (this.password === null) {
            this.password = this.kernel.generate_strong_password()
            // 显示密码
            $("password_show").title = this.password
            // 是否自动复制
            if ($prefs.get("settings.general.auto_copy")) {
                this.copy_password(this.password)
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

    search(account) {
        let data = this.kernel.storage.search(account)
        if (data.length > 0) {
            $("password_list").data = this.password_list_to_ui(data)
        } else {
            $("password_list").data = [{
                id: {
                    text: ""
                },
                website_data: {
                    text: ""
                },
                website: {
                    text: ""
                },
                password: {
                    text: ""
                },
                account: {
                    text: ""
                },
                date: {
                    text: ""
                },
                no_result: {
                    text: $l10n("NO_RESULT")
                }
            }]
        }
    }

    password_list_to_ui(data) {
        function get_label(password) {
            return {
                id: {
                    text: password.id
                },
                website_data: {
                    text: JSON.stringify(password.website)
                },
                website: {
                    text: password.website[0]
                },
                password: {
                    text: password.password
                },
                account: {
                    text: password.account
                },
                date: {
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
                            this.ui_password()
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
                        style: 1,
                        reorder: false,
                        rowHeight: 60,
                        footer: {
                            type: "label",
                            props: {
                                height: 20,
                                text: $l10n("LIST_END"),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.center,
                                font: $font(12)
                            }
                        },
                        data: this.password_list_to_ui(this.kernel.storage.all()),
                        actions: [
                            {
                                title: $l10n("DELETE"),
                                color: $color("red"),
                                handler: (sender, indexPath) => {
                                    let delete_action = () => {
                                        let id = sender.object(indexPath).id.text
                                        if (this.kernel.storage.delete(id)) {
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
                                                { title: $l10n("CANCEL") }
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
                                        id: "id",
                                        hidden: true,
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "website_data",
                                        hidden: true,
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "website",
                                        font: $font(18),
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.top.inset(10)
                                        make.left.inset(10)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "account",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.left
                                    },
                                    layout: (make, view) => {
                                        make.bottom.inset(5)
                                        make.left.inset(10)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "date",
                                        font: $font(14),
                                        textColor: $color({
                                            light: "#C0C0C0",
                                            dark: "#DDDDDD"
                                        }),
                                        align: $align.right
                                    },
                                    layout: (make, view) => {
                                        make.bottom.inset(5)
                                        make.right.inset(10)
                                    }
                                },
                                {
                                    type: "label",
                                    props: {
                                        id: "no_result",
                                        align: $align.center
                                    },
                                    layout: (make, view) => {
                                        make.left.right.inset(10)
                                        make.top.inset(15)
                                    }
                                }
                            ]
                        }
                    },
                    events: {
                        didSelect: (sender, indexPath, data) => {
                            if (data.no_result.text.trim() !== $l10n("NO_RESULT")) {
                                let password = {
                                    id: sender.object(indexPath).id.text,
                                    account: sender.object(indexPath).account.text,
                                    password: sender.object(indexPath).password.text,
                                    website: JSON.parse(sender.object(indexPath).website_data.text),
                                    date: sender.object(indexPath).date.text
                                }
                                this.ui_password(password, $l10n("EDIT"))
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.top.equalTo(50)
                        make.bottom.inset(5)
                        make.right.left.inset(0)
                    },
                }
            ]
        })
    }

    ui_password(password = null, title = $l10n("ADD_PASSWORD")) {
        if (password === null) {
            password = {
                id: null,
                account: "",
                password: "",
                website: [],
                date: ""
            }
        }
        $ui.push({
            props: {
                id: "ui_password",
                title: title,
                navButtons: [
                    {
                        title: $l10n("SAVE"),
                        image: $image("assets/icon/check.png"),
                        handler: (sender) => {
                            password.account = $("account").text.trim()
                            password.password = $("password").text.trim()
                            password.website = $("website").data
                            password.date = new Date().toLocaleDateString()
                            let is_update = false
                            if (password.id !== null) {
                                password['id'] = password.id
                                is_update = true
                            }
                            this.save(password, is_update)
                        }
                    },
                    {
                        title: $l10n("COPY"),
                        image: $image("assets/icon/copy.png"),
                        handler: (sender) => {
                            this.copy_password(password.password)
                        }
                    }
                ],
            },
            views: [
                {
                    type: "label",
                    props: {
                        text: $l10n("ACCOUNT"),
                        align: $align.left,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        }),
                        line: 1,
                    },
                    layout: (make, view) => {
                        make.left.inset(10)
                        make.width.equalTo(40)
                        make.top.equalTo(10)
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "account",
                        align: $align.left,
                        insets: 0,
                        text: password.account,
                        placeholder: $l10n("ACCOUNT"),
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo(25)
                    },
                    events: {
                        returned: sender => {
                            sender.blur()
                        }
                    }
                },
                {
                    type: "label",
                    props: {
                        text: $l10n("PASSWORD"),
                        align: $align.left,
                        font: $font(12),
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#DDDDDD"
                        }),
                        line: 1,
                    },
                    layout: (make, view) => {
                        make.left.inset(10)
                        make.top.equalTo($("account").top).offset(40 + 10)
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "password",
                        align: $align.left,
                        text: password.password,
                        placeholder: $l10n("PASSWORD"),
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo($("account").top).offset(40 + 25)
                    },
                    events: {
                        returned: sender => {
                            sender.blur()
                        }
                    }
                },
                {
                    type: "input",
                    props: {
                        id: "website_inbox",
                        type: $kbType.url,
                        align: $align.left,
                        placeholder: $l10n("WEBSITE"),
                    },
                    layout: (make, view) => {
                        make.right.inset(80)
                        make.left.inset(10)
                        make.height.equalTo(40)
                        make.top.equalTo($("password").top).offset(40 + 20)
                    },
                    events: {
                        returned: sender => {
                            if (sender.text === "") return
                            let website = $("website")
                            website.insert({
                                index: website.data.length,
                                value: sender.text
                            })
                            sender.blur()
                            sender.text = ""
                        }
                    }
                },
                {
                    type: "button",
                    props: {
                        title: $l10n("ADD"),
                        contentEdgeInsets: 10,
                    },
                    layout: (make, view) => {
                        make.right.inset(10)
                        make.width.equalTo(60)
                        make.height.equalTo(40)
                        make.top.equalTo($("password").top).offset(40 + 20)
                    },
                    events: {
                        tapped: sender => {
                            let website_inbox = $("website_inbox")
                            if (website_inbox.text === "") return
                            let website = $("website")
                            website.insert({
                                index: website.data.length,
                                value: website_inbox.text
                            })
                            website_inbox.blur()
                            website_inbox.text = ""
                        }
                    }
                },
                {
                    type: "list",
                    props: {
                        id: "website",
                        reorder: false,
                        header: {
                            type: "label",
                            props: {
                                height: 20,
                                text: $l10n("WEBSITE"),
                                textColor: $color({
                                    light: "#C0C0C0",
                                    dark: "#DDDDDD"
                                }),
                                align: $align.left,
                                font: $font(12)
                            }
                        },
                        data: password.website,
                        actions: [
                            {
                                title: "delete",
                                handler: (sender, indexPath) => {

                                }
                            }
                        ]
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.bottom.inset(10)
                        make.top.equalTo($("website_inbox").top).offset(40 + 15)
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
                        id: "password_show",
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
                            this.copy_password(this.password)
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
                        make.top.equalTo($("password_show").top).offset(40)
                    }
                },
                {
                    type: "button",
                    props: {
                        title: $l10n("SAVE"),
                        contentEdgeInsets: 10
                    },
                    layout: (make, view) => {
                        make.left.right.inset(10)
                        make.bottom.inset(140)
                    },
                    events: {
                        tapped: sender => {
                            if (this.password !== null) {
                                this.ui_password({ password: this.password })
                            }
                        }
                    }
                },
                {
                    type: "button",
                    props: {
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