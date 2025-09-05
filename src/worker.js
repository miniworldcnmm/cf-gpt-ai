// src/worker.js
// 完整 Worker 文件 —— HTML 已 Base64 内嵌，getHTML() 解码返回，避免构建错误。

// ------------------ 响应式 HTML 的 Base64（不要编辑此行注释） ------------------
const HTML_BASE64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9InpoLUNOIj4KPGhlYWQ+CiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+CiAgICA8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgdmlld3BvcnQtZml0PWNvdmVyIj4KICAgIDx0aXRsZT5DRiBBSSBDaGF0IC0gUmVzcG9uc2l2ZTwvdGl0bGU+CiAgICA8c3R5bGU+CiAgICAgICAgLyogUmVzZXQgJiBiYXNlICovCiAgICAgICAgKiB7IG1hcmdpbiwgMCA7IHBhZGRpbmc6IDAgOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9CiAgICAgICAgaHRtbCwgYm9keSB7IGhlaWdodDogMTAwJTsgfQogICAgICAgIGJvZHkgeyBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNyb3N5c3RpbmYsICJTZWdvZSBVSSIsIFJvYm90bywgIkhlbHZldGljYSBOZXVlIiwgQXJpYWwsICJOb3RvIFNhbnMiLCJNaWNyb3NvZnQgWWFIZWkiLCBzYW5zLXNlcmlmOyBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNjY3ZWVhIDAlLCAjNzY0YmEyIDEwMCUpOyBjb2xvcjojMTExODI3OyB9CgogICAgICAgIC8qIExheW91dCBjb250YWluZXIgKi8KICAgICAgIC5hcHAgeyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDB2aHg7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGJhY2tncm91bmQ6IHdoaXRlOyBib3JkZXItcmFkaXVzOiA4cHggOyBvdmVyZmxvdzogaGlkZGVuOyB9CiAgICAgICAgLmhlYWRlciB7IGRpc3BsYXkOZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47IGdhcDogMTJweDsgcGFkZGluZzoxMnB4IDE2cHg7IGJhY2tncm91bmQ6IGxpbmVhcjogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzRmNDZlNSAwJSwgIzdjM2FlZCAxMDAlKTsgY29sb3I6ICNmZmY7IH0KICAgICAgICAuaGVhZGVyLWxlZnQgeyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjEycHg7IH0KICAgICAgICAubG9nbyB7IGZvbnQtc2l6ZToxOHB4OyBmb250LXdlaWdodDoxMDA7IH0KICAgICAgICAuc3VidGl0bGUgeyBmb250LXNpemU6MTJweDsgb3BhY2l0eTowLjk7IH0KCiAgICAgICAgLyogU2lkZWJhciAmIG1haW4gKi8KICAgICAgICAubWFpbi13cmFwIHsgZmxleDoxOyBkaXNwbGF5OmZsZXg7IG1pbi1oZWlnaHQ6MDsgLyogYWxsb3cgY2hpbGRyZW4gdG8gc2Nyb2xsICovIH0KCiAgICAgICAgLnNpZGViYXIgeyB3aWR0aDowLjg4OTk5OTk5OwAgaW5pdGlhbC13aWR0aDowLjg4OTk5OTk5OyBtYXgtd2lkdGg6IDM4MHB4OyBtaW4td2lkdGg6MjQwcHg7IGJhY2tncm91bmQ6I2Y4ZmFmYzt9CiAgICAgICAgLmNoYXQgeyBmbGV4OjE7IGRpc3BsYXk6ZmxleDsgZmxleC1kaXJlY3Rpb246Y29sdW1uOyBtaW4td2lkdGg6MDsgfQoICAgICAgICAubWVzc2FnZXMgeyBmbGV4OjE7IG92ZXJmbG93LXk6IGF1dG87IHBhZGRpbmc6IDE2cHg7IGJhY2tncm91bmQ6ICNmYWZmYWY7IG1pbi1oZWlnaHQ6MDsgfQoICAgICAgICAubWVzc2FnZSB7IG1hcmdpbi1ib3R0b206IDE2cHg7IG1heC13aWR0aDo4MCU7IH0KICAgICAgICAubWVzc2FnZS51c2VyIHsgbWFyZ2luLWxlZnQ6YXV0bzsgfQogICAgICAgIC5tZXNzYWdlLWNvbnRlbnQgeyBwYWRkaW5nOjEycHggMTRweDsgYm9yZGVyLXJhZGl1czoxMnB4OyBsaW5lLWhlaWdodDoxLjY7IH0KICAgICAgICAubWVzc2FnZS51c2VyIC5tZXNzYWdlLWNvbnRlbnQgeyBiYWNrZ3JvdW5kOiAjNGY0NmU1OyBjb2xvcjojZmZmOyB9CiAgICAgICAgLm1lc3NhZ2UuYXNzaXN0YW50IC5tZXNzYWdlLWNvbnRlbnQgeyBiYWNrZ3JvdW5kOiNmZmY7IGJvcmRlcjoxcHggc29saWQgI2UyZThmMDsgfQoCiAgICAgICAgLmlucHV0LWFyZWEgeyBwYWRkaW5nOjEycHg7IGJvcmRlci10b3A6MXB4IHNvbGlkICNlMmU4ZjA7IGJhY2tncm91bmQ6IHdoaXRlOyB9CiAgICAgICAgLmlucHV0LXJvdyB7IGRpc3BsYXk6IGZsZXg7IGdhcDogOHB4OyBhbGlnbi1pdGVtczpjZW50ZXI7IH0KICAgICAgICAubWVzc2FnZS1pbnB1dCB7IGZsZXg6MTsgbWluLWhlaWdodDoyLjZweDsgcGFkZGluZzoxMnB4OyBib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7IGJvcmRlci1yYWRpdXM6MTJweDsgcmVzaXplOnZlcnRpY2FsOyBmb250LXNpemU6MTRweDsgfQogICAgICAgIC5idG4geyBiYWNrZ3JvdW5kOiM0ZjQ2ZTU7IGNvbG9yOiNmZmY7IGJvcmRlcjpub25lOyBwYWRkaW5nOjEwcHggMTRweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBjdXJzb3I6cG9pbnRlcjsgZm9udC13ZWlnaHQ6NjAwOyB9CiAgICAgICAgLmJ0bi5zZWNvbmRhcnkgeyBiYWNrZ3JvdW5kOiM2YjcyODA7IH0KICAgICAgICAuc2VuZC1idG4geyBoZWlnaHQ6NDBweDsgcGFkZGluZzogMDggMjBweDsgYmFja2dyb3VuZDogIzEwYjk4MTsgYm9yZGVyLXJhZGl1czoxMnB4OyB9CiAgICAgICAgLmxvYWRpbmcgeyBkaXNwbGF5Om5vbmU7IHRleHQtYWxpZ246Y2VudGVyOyBwYWRkaW5nOjEycHg7IGNvbG9yOiM2YjcyODA7IH0KCiAgICAgICAgLyogTW9kZWwgJiBhdXRoIGJsb2NrcyAqLwogICAgICAgIC5hdXRoLXNlY3Rpb24sIC5tb2RlbC1zZWN0aW9uIHsgbWFyZ2luLWJvdHRvbToxNnB4OyB9CiAgICAgICAgLmF1dGgtc2VjdGlvbiB7IHBhZGRpbmc6MTJweDsgYm9yZC1yYWRpdXM6MTJweDsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmYTlhOSAwJSwgI3RlY2YlMDAgMTAwJSk7IGJvcmRlcjojMmI2YjlkOyB9CiAgICAgICAgLmF1dGgtc2VjdGlvbi5hdXRoZW50aWNhdGVkIHsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2E4ZWRlYSAwJSwgI2ZlZDZlMyAxMDAlKTsgYm9yZGVyLWNvbG9yOiAjNGZhY2ZlOyB9CiAgICAgICAgLm1vZGVsLXNlbGVjdCwgLmlucHV0LWdyb3VwIGlucHV0IHsgd2lkdGg6IDEwMCU7IHBhZGRpbmc6IDEwcHg7IGJvcmRlcjoxcHggc29saWQgI2QxZDVkYjsgYm9yZGVyLXJhZGl1czg6O30KICAgICAgICAubW9kZWwtaW5mbyB7IGJhY2tncm91bmQ6I2YxZjVmOTsgcGFkZGluZzoxMHB4OyBib3JkZXItcmFkaXVzOjhweDsgZm9udC1zaXplOjEzcHg7IGxpbmUtaGVpZ2h0OjEuNDsgbWFyZ2luLXRvcDo4cHg7IH0KCiAgICAgICAgLyogQ29kZSBibG9jayBzdHlsZXMgKi8KICAgICAgICAuY29kZS1ibG9jayB7IG1hcmdpbjoxMnB4IDA7IGJvcmRlci1yYWRpdXM6OHB4OyBvdmVyZmxvdzoWaGlkZGVuOyBib3JkZXI6MXB4IHNvbGlkICNkMWQ1ZGI7IGJhY2tncm91bmQ6ICNmZmY7IH0KICAgICAgICAuY29kZS1oZWFkZXIgeyBiYWNrZ3JvdW5kOiNmOWZhZmI7IHBhZGRpbmc6OHB4IDEycHg7IGRpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47IGJvcmRlci1ib3R0b206MXB4IHNvbGlkICNlNWU3ZWI7IGZvbnQtc2l6ZToxMnB4OyB9CiAgICAgICAgcHJlIHsgcGFkZGluZzoxMnB4OyBtYXJnaW46MDsgb3ZlcmZsb3c6YXV0bzsgZm9udC1mYW1pbHk6ICdGaXJhIENvZGUnLCAnQ29uc29sYScsIG1vbm9zcGFjZTsgZm9udC1zaXplOjEzcHg7IH0KICAgICAgICAuaW5saW5lLWNvZGUgeyBiYWNrZ3JvdW5kOiNmM2Y0ZjY7IHBhZGRpbmc6MnB4IDZweDsgYm9yZGVyLXJhZGl1czoxMHB4OyB9CiAgICAgICAgCiAgICAgICAgLyogTWFya2Rvd24gc3R5bGUgKGV0Yy4pICovCiAgICAgICAgLm1kLWhxMSB7IGZvbnQtc2l6ZToxOHB4OyBmb250LXdlaWdodDoxMDA7IGNvbG9yOiMxZjI5Mzc7IG1hcmdpbjoxMHB4IDA7IGJvcmRlci1ib3R0b206MnB4IHNvbGlkICNlNWU3ZWI7IHBhZGRpbmc6NXB4OyB9CiAgICAgICAgLm1kLWEyIHsgZm9udC1zaXplOjE2cHg7IGZvbnQtd2VpZ2h0OjcwMDsgY29sb3I6IzM3NDUxOyBtYXJnaW46OHB4IDA7IH0KICAgICAgICAubWR1bCB7IG1hcmdpbjothfM7IH0KICAgICAgICAubWRibG9ja3F1b3RlIHsgYmFja2dyb3VuZDogI2YzZjRmNjsgYm9yZGVyLWxlZnQ6NHB4IHNvbGlkICM2YjcyODA7IHBhZGRpbmc6MTBweDsgbWFyZ2luOjhweDsgZmVudC1zdHlsZTppdGFsaWM7IH0KCiAgICAgICAgLyogSGVhZGVyIG1vYmlsZSBjb250cm9scyAqLwogICAgICAgIC5oZWFkZXIgLmNvbnRyb2xzIHsgZGlzcGxheTpmbGV4OyBndXBzOjhweDsgYWxpZ24taXRlbXM6Y2VudGVyOyB9CiAgICAgICAgLmhhbWJ1cmdlciB7IGRpc3BsYXk6bm9uZTsgd2lkdGg6NDBweDsgaGVpZ2h0OjQwcHggOyBib3JkZXItcmFkaXVzOjhweDsgYmFja2dyb3VuZDogcmdiYSgtKSB9CgogICAgICAgIC8qIFNpZGViYXIgb3ZlcmxheSBmb3IgbW9iaWxlICovCiAgICAgICAgLnNpZGViYXIuY292ZXIgeyBwb3NpdGlvbjpmpeJ9CiAgICAgICAgPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KICAgIDxkaXYgY2xhc3M9ImFwcCIgaWQ9ImFwcCI+CiAgICAgICAgPGhlYWRlcj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iaGVhZGVyLWxlZnQiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iaGFtYnVyZ2VyIiBpZD0iaGFtYnVyZ2VyIiByb2xlPSJidXR0b24iIGFyaWEtbGFiZWw9IuS9kSIgdGl0bGU9IuS9kSI+4oCiPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImxvZ28iPuKAmkNIIEFJIENoYXQ8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJzdWJ0aXRsZSI+5rWL6K+V5ZCI77yM5p2O5YyWPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImNvbnRyb2xzIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImF1dGhvcmluZm8iIGlkPSJhdXRobkJ0biIgc3R5bGU9InRleHQ6IHdoaXRlOyBwYWRkaW5nOjZweCAxMHB4OyBib3JkZXItcmFkaXVzOjhweDsiPgogICAgICAgICAgICAgICAgICAgIDxwPjEmJmNvcHR7PC9wPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICA8L2hlYWRlcj4KCiAgICAgICAgPGRpdiBjbGFzcz0ibWFpbi13cmFwIj4KICAgICAgICAgICAgPCEtLSBTaWRlYmFyIGZvciBkZXNrdG9wIC0tPgogICAgICAgICAgICA8YXNpZGUgY2xhc3M9InNpZGViYXIiIGlkPSJzaWRlYmFyIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImF1dGgtc2VjdGlvbiIgaWQ9ImF1dGhTZWN0aW9uIj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJpbnB1dC1ncm91cCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD4uLi48L2xhYmVsPgogICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT0icGFzc3dvcmQiIGlkPSJwYXNzd29yZElucHV0IiBwbGFjZWhvbGRlcj0i5L2T5aW9Iikgb25rZXlkb3duPSJoYW5kbGVQYXNzd29yZEtleURvd24oZXZlbnQpIj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOjEwcHg7ZGlzcGxheTpmbGV4O2dhcDo4cHg7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIiBvbmNsaWNrPSJhdXRoZW50aWNhdGUoKSI+5b3g5a2QPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBzZWNvbmRhcnkiIG9uY2xpY2s9InRlc3RDb3B5RnVuY3Rpb24oKSI+6YWN5YyBBPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJtb2RlbC1zZWN0aW9uIiBpZD0ibW9kZWxTZWN0aW9uIiBzdHlsZT0iZGlzcGxheTpub25lOyI+CiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj0iLyI+44CC44CCPC9hPgogICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgaWQ9Im1vZGVsU2VsZWN0IiBjbGFzcz0ibW9kZWwtc2VsZWN0IiBvbmNoYW5nZT0idXBkYXRlTW9kZWxJbmZvKCkiPgogICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPSIiPlx1NDBkNjUg5b3Ag5b2Q5LiKPC9vcHRpb24+CiAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ibW9kZWwtaW5mbyIgaWQ9Im1vZGVsSW5mbyI+5L2g5aW9PC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJoaXN0b3J5LXNlY3Rpb24iIGlkPSJoaXN0b3J5U2VjdGlvbiIgc3R5bGU9ImRpc3BsYXk6bm9uZTsiPgogICAgICAgICAgICAgICAgICAgIDxoMyA+4oCiPC9oMz4KICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7Z2FwOjhweDsgZmxleC13cmFwOnRy1zc7Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIHNlY29uZGFyeSIgb25jbGljaz0ibG9hZEhpc3RvcnkoKSI+5bGxPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBzZWNvbmRhcnkiIG9uY2xpY2s9ImNsZWFySGlzdG9yeSgpIj7lvJfloLzlj7w8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjEzcHggY29sb3I6I2ZiZmZiOyBtYXJnaW46OHB4IDA7Ij4KICAgICAgICAgICAgICAgICAgICA8cD7kuI3nq6jlj5HljaE8L3A+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9hc2lkZT4KCiAgICAgICAgICAgIDwhLS0gT3ZlcmxheSBzaWRlYmFyIGZvciBtb2JpbGUgLS0+CiAgICAgICAgICAgIDxhc2lkZSBjbGFzcz0ic2lkZWJhciBvdmVybGF5IiBpZD0ibW9iaWxlU2lkZWJhciIgYXJpYS1oaWRkZW49InRydWUiPjwvYXNpZGU+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImJhY2tncm90IiBpZD0iYmFja2Ryb3AiIHRhYj0iLTEiIGFyaWEtaGlkZGVuPSJ0cnVlIj48L2Rpdj4KCiAgICAgICAgICAgIDxtYWluIGNsYXNzPSJjaGF0IiBpZD0iY2hhdEFyZWEiPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ibWVzc2FnZXMiIGlkPSJtZXNzYWdlcyIgcm9sZT0ibG9nIiBhcmktbGl2ZT0icG9saXRlIj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXNzYWdlIGFzc2lzdGFudCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1lc3NhZ2UtY29udGVudCI+8J+RiCDotVIG5aW5u5pc3aG5mW5k8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0ibG9hZGluZyIgaWQ9ImxvYWRpbmciPuS6pXxEPC9kaXY+CiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJpbnB1dC1hcmVhIj4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJpbnB1dC1yb3ciPgogICAgICAgICAgICAgICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3M9Im1lc3NhZ2UtaW5wdXQiIGlkPSJtZXNzYWdlSW5wdXQiIHBsYWNlaG9sZGVyPSLkuK3liI98IiBhcmlhLWxhYmVsPSLlwqZJbCIgZGlzYWJsZWQgb25rZXlkb3duPSJoYW5kbGVLZXlEb3duKGV2ZW50KSI+PC90ZXh0YXJlYT4KICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIHNlbmQtYnRuIiBpZD0ic2VuZEJ0biIgb25jbGljaz0ic2VuZE1lc3NhZ2UoKSIgZGlzYWJsZWQ+5ZyLPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L21haW4+CiAgICAgICAgPC9kaXY+CjwvYm9keT4K
";
// -------------------------------------------------------------------------------

// ========== Worker 主体 ==========

export default {
  async fetch(request, env, ctx) {
    // 验证作者信息完整性（若失败，返回 403）
    try {
      verifyAuthorInfo();
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        status: "服务已停止运行"
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 根路径返回 HTML
      if (url.pathname === '/') {
        return new Response(getHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders }
        });
      }

      // /api/models 返回 MODEL_CONFIG
      if (url.pathname === '/api/models') {
        return new Response(JSON.stringify(MODEL_CONFIG), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // /api/chat POST
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, corsHeaders);
      }

      // /api/history GET
      if (url.pathname === '/api/history' && request.method === 'GET') {
        return await getHistory(request, env, corsHeaders);
      }

      // /api/history POST
      if (url.pathname === '/api/history' && request.method === 'POST') {
        return await saveHistory(request, env, corsHeaders);
      }

      // /api/debug-gpt POST
      if (url.pathname === '/api/debug-gpt' && request.method === 'POST') {
        return await debugGPT(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: '服务器内部错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// ----------------------- 服务器端常量与函数（保留你原始逻辑） -----------------------

const AUTHOR_INFO = {
  name: "康康的订阅天地",
  platform: "YouTube",
  verified: true
};

function verifyAuthorInfo() {
  if (AUTHOR_INFO.name !== "康康的订阅天地" ||
      AUTHOR_INFO.platform !== "YouTube" ||
      !AUTHOR_INFO.verified) {
    throw new Error("作者信息已被篡改，服务拒绝运行！请保持原始作者信息：YouTube：康康的订阅天地");
  }
}

function getModelOptimalParams(modelKey, modelId) {
  const baseParams = { stream: false };

  switch (modelKey) {
    case 'deepseek-r1':
      return { ...baseParams, max_tokens: 8192, temperature: 0.8, top_p: 0.9, top_k: 50, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'gpt-oss-120b':
    case 'gpt-oss-20b':
      return {};
    case 'llama-4-scout':
      return { ...baseParams, max_tokens: 4096, temperature: 0.75, top_p: 0.95, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'qwen-coder':
      return { ...baseParams, max_tokens: 8192, temperature: 0.3, top_p: 0.8, top_k: 30, repetition_penalty: 1.1, frequency_penalty: 0.1, presence_penalty: 0.1 };
    case 'gemma-3':
      return { ...baseParams, max_tokens: 4096, temperature: 0.8, top_p: 0.9, top_k: 40, repetition_penalty: 1.0, frequency_penalty: 0.1, presence_penalty: 0.1 };
    default:
      return { ...baseParams, max_tokens: 2048 };
  }
}

const MODEL_CONFIG = {
  "deepseek-r1": {
    "id": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    "name": "DeepSeek-R1-Distill-Qwen-32B",
    "description": "思维链推理模型，支持复杂逻辑推理和数学计算",
    "context": 80000,
    "max_output": 8192,
    "input_price": 0.50,
    "output_price": 4.88,
    "use_messages": true,
    "features": ["思维链推理", "数学计算", "代码生成"]
  },
  "gpt-oss-120b": {
    "id": "@cf/openai/gpt-oss-120b",
    "name": "OpenAI GPT-OSS-120B",
    "description": "生产级通用模型，高质量文本生成和推理",
    "context": 128000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.75,
    "use_input": true,
    "features": ["通用对话", "文本分析", "创意写作"]
  },
  "gpt-oss-20b": {
    "id": "@cf/openai/gpt-oss-20b",
    "name": "OpenAI GPT-OSS-20B",
    "description": "低延迟快速响应模型，适合实时对话",
    "context": 128000,
    "max_output": 2048,
    "input_price": 0.20,
    "output_price": 0.30,
    "use_input": true,
    "features": ["快速响应", "实时对话", "简单任务"]
  },
  "llama-4-scout": {
    "id": "@cf/meta/llama-4-scout-17b-16e-instruct",
    "name": "Meta Llama 4 Scout",
    "description": "多模态模型，支持文本和图像理解分析",
    "context": 131000,
    "max_output": 4096,
    "input_price": 0.27,
    "output_price": 0.85,
    "use_messages": true,
    "features": ["多模态", "图像理解", "长文档分析"]
  },
  "qwen-coder": {
    "id": "@cf/qwen/qwen2.5-coder-32b-instruct",
    "name": "Qwen2.5-Coder-32B",
    "description": "代码专家模型，擅长编程和技术问题",
    "context": 32768,
    "max_output": 8192,
    "input_price": 0.66,
    "output_price": 1.00,
    "use_messages": true,
    "features": ["代码生成", "调试分析", "技术文档"]
  },
  "gemma-3": {
    "id": "@cf/google/gemma-3-12b-it",
    "name": "Gemma 3 12B",
    "description": "多语言模型，支持140+种语言和文化理解",
    "context": 80000,
    "max_output": 4096,
    "input_price": 0.35,
    "output_price": 0.56,
    "use_prompt": true,
    "features": ["多语言", "文化理解", "翻译"]
  }
};

// ----------------- 路由处理与 AI 调用函数 -----------------

async function handleChat(request, env, corsHeaders) {
  try {
    const { message, model, password, history = [] } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (message === 'test') {
      return new Response(JSON.stringify({ reply: 'test', model: 'test' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (!MODEL_CONFIG[model]) {
      return new Response(JSON.stringify({ error: '无效的模型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const selectedModel = MODEL_CONFIG[model];

    const maxHistoryLength = Math.floor(selectedModel.context / 1000);
    const recentHistory = history.slice(-maxHistoryLength);

    let response;
    let reply;

    try {
      if (selectedModel.use_input) {
        let userInput;
        if (message === 'test') {
          userInput = "What is the origin of the phrase Hello, World?";
        } else {
          userInput = `请用中文回答以下问题：${message}`;
        }

        response = await env.AI.run(selectedModel.id, { input: userInput });
        reply = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_prompt) {
        const promptText = recentHistory.length > 0
          ? `你是一个智能AI助手，请务必用中文回答所有问题。\n\n历史对话:\n${recentHistory.map(h => `${h.role}: ${h.content}`).join('\n')}\n\n当前问题: ${message}\n\n请用中文回答:`
          : `你是一个智能AI助手，请务必用中文回答所有问题。\n\n问题: ${message}\n\n请用中文回答:`;

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const promptParams = { prompt: promptText, ...optimalParams };

        response = await env.AI.run(selectedModel.id, promptParams);
        reply = extractTextFromResponse(response, selectedModel);

      } else if (selectedModel.use_messages) {
        const messages = [
          { role: "system", content: "你是一个智能AI助手，请务必用中文回答所有问题。无论用户使用什么语言提问，你都必须用中文回复。请确保你的回答完全使用中文，包括专业术语和代码注释。" },
          ...recentHistory.map(h => ({ role: h.role, content: h.content })),
          { role: "user", content: `${message}\n\n请用中文回答:` }
        ];

        const optimalParams = getModelOptimalParams(model, selectedModel.id);
        const messagesParams = { messages, ...optimalParams };

        response = await env.AI.run(selectedModel.id, messagesParams);
        reply = extractTextFromResponse(response, selectedModel);
      }

    } catch (error) {
      console.error('AI模型调用失败:', error);
      throw new Error(`${selectedModel.name} 调用失败: ${error.message}`);
    }

    if (selectedModel.id.includes('deepseek') && reply && reply.includes('<think>')) {
      const thinkEndIndex = reply.lastIndexOf('</think>');
      if (thinkEndIndex !== -1) {
        reply = reply.substring(thinkEndIndex + 8).trim();
      }
    }

    if (reply && typeof reply === 'string') {
      reply = formatMarkdown(reply);
    } else {
      reply = reply || '抱歉，AI模型没有返回有效的回复内容。';
    }

    return new Response(JSON.stringify({
      reply: reply,
      model: selectedModel.name,
      usage: response ? response.usage : null
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({
      error: '调用AI模型时发生错误: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function getHistory(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const sessionId = url.searchParams.get('sessionId') || 'default';

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const historyData = await env.CHAT_HISTORY.get(`history:${sessionId}`);
    const history = historyData ? JSON.parse(historyData) : [];

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get history error:', error);
    return new Response(JSON.stringify({ error: '获取历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function saveHistory(request, env, corsHeaders) {
  try {
    const { password, sessionId = 'default', history } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const maxHistoryItems = 100;
    const trimmedHistory = history.slice(-maxHistoryItems);

    await env.CHAT_HISTORY.put(`history:${sessionId}`, JSON.stringify(trimmedHistory));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Save history error:', error);
    return new Response(JSON.stringify({ error: '保存历史记录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function debugGPT(request, env, corsHeaders) {
  try {
    const { message, password } = await request.json();

    if (password !== env.CHAT_PASSWORD) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const response = await env.AI.run('@cf/openai/gpt-oss-20b', {
      input: message || 'Hello, World!'
    });

    return new Response(JSON.stringify({
      debug: true,
      response: response,
      extractedText: extractTextFromResponse(response, null)
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Debug GPT error:', error);
    return new Response(JSON.stringify({
      error: '调试GPT时发生错误: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ----------------- 辅助：解析 AI 返回、格式化 Markdown 等 -----------------

function extractTextFromResponse(response, modelConfig) {
  if (typeof response === 'string') {
    return response.trim() || '模型返回了空响应';
  }

  if (!response || typeof response !== 'object') {
    return 'AI模型返回了无效的响应格式';
  }

  if (response.output && Array.isArray(response.output)) {
    for (const outputItem of response.output) {
      if (outputItem.type === 'message' && outputItem.content && Array.isArray(outputItem.content)) {
        for (const contentItem of outputItem.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            return contentItem.text.trim();
          }
        }
      }
    }
  }

  const gptFields = [
    'reply', 'response', 'result', 'content', 'text', 'output', 'answer', 'message',
    'completion', 'generated_text', 'prediction'
  ];

  for (const field of gptFields) {
    if (response[field] && typeof response[field] === 'string') {
      const text = response[field].trim();
      if (text) return text;
    }
  }

  if (response.result && typeof response.result === 'object') {
    for (const field of gptFields) {
      if (response.result[field] && typeof response.result[field] === 'string') {
        const text = response.result[field].trim();
        if (text) return text;
      }
    }
  }

  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content.trim() || '模型返回了空内容';
  }

  if (response.choices?.[0]?.text) {
    return response.choices[0].text.trim() || '模型返回了空内容';
  }

  let longestText = '';
  for (const [key, value] of Object.entries(response)) {
    if (typeof value === 'string' && value.trim() && value.length > longestText.length) {
      if (!['usage', 'model', 'id', 'created', 'object'].includes(key)) {
        longestText = value.trim();
      }
    }
  }

  if (longestText) return longestText;

  console.log('无法提取文本，完整响应:', JSON.stringify(response, null, 2));
  return `无法从响应中提取文本内容。响应结构: ${Object.keys(response).join(', ')}`;
}

function autoDetectAndFormatCode(text) {
  const codePatterns = [
    { pattern: /^(import\s+\w+|from\s+\w+\s+import|def\s+\w+|class\s+\w+|if\s+__name__|for\s+\w+\s+in|while\s+.+:|try:|except:)/m, lang: 'python' },
    { pattern: /^(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+|=>\s*{|console\.log|document\.|window\.)/m, lang: 'javascript' },
    { pattern: /^<[^>]+>.*<\/[^>]+>$/m, lang: 'html' },
    { pattern: /^[^{}]*{[^{}]*}$/m, lang: 'css' },
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/mi, lang: 'sql' },
    { pattern: /^{\s*"[^"]+"\s*:\s*.+}$/m, lang: 'json' },
    { pattern: /^(#!\/bin\/|curl\s+|wget\s+|sudo\s+|apt\s+|npm\s+|pip\s+|git\s+)/m, lang: 'bash' }
  ];

  for (const { pattern, lang } of codePatterns) {
    if (pattern.test(text) && !text.includes('```')) {
      const lines = text.split('\n');
      if (lines.length > 3 && lines.some(line => line.startsWith('  ') || line.startsWith('\t'))) {
        return `\`\`\`${lang}\n${text}\n\`\`\``;
      }
    }
  }

  return text;
}

function detectLanguage(code) {
  const langPatterns = [
    { pattern: /^(import\s|from\s.*import|def\s|class\s|if\s+__name__|print\()/m, lang: 'python' },
    { pattern: /^(function\s|const\s|let\s|var\s|console\.log|document\.|window\.)/m, lang: 'javascript' },
    { pattern: /^(<\?php|namespace\s|use\s|\$\w+\s*=)/m, lang: 'php' },
    { pattern: /^(#include|int\s+main|printf\(|cout\s*<<)/m, lang: 'cpp' },
    { pattern: /^(public\s+(class|static)|import\s+java|System\.out)/m, lang: 'java' },
    { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)/mi, lang: 'sql' },
    { pattern: /^<[^>]+>.*<\/[^>]+>/m, lang: 'html' },
    { pattern: /^[^{}]*\{[^{}]*\}/m, lang: 'css' },
    { pattern: /^(#!\/bin\/|curl\s|wget\s|sudo\s|apt\s|npm\s|pip\s|git\s)/m, lang: 'bash' },
    { pattern: /^{\s*"[^"]+"\s*:/m, lang: 'json' }
  ];

  for (const { pattern, lang } of langPatterns) {
    if (pattern.test(code)) {
      return lang;
    }
  }

  return 'text';
}

function formatMarkdown(text) {
  if (!text || typeof text !== 'string') {
    console.warn('formatMarkdown收到无效输入:', { text, type: typeof text });
    return text || '';
  }

  text = autoDetectAndFormatCode(text);

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
  }

  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const detectedLang = lang || detectLanguage(code);
    const encodedCode = btoa(unescape(encodeURIComponent(code)));
    return `<div class="code-block">
      <div class="code-header">
        <span class="language">${detectedLang.toUpperCase()}</span>
        <button class="copy-btn" onclick="copyCodeBlock(this)" data-code="${encodedCode}">复制</button>
      </div>
      <pre><code class="language-${detectedLang}">${escapeHtml(code)}</code></pre>
    </div>`;
  });

  text = text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${escapeHtml(code)}</code>`;
  });

  text = text.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong class="md-bold">$1</strong>');

  text = text.replace(/\*(.*?)\*/g, '<em class="md-italic">$1</em>');
  text = text.replace(/_(.*?)_/g, '<em class="md-italic">$1</em>');

  text = text.replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^- (.*$)/gim, '<li class="md-li">$1</li>');
  text = text.replace(/^\d+\. (.*$)/gim, '<li class="md-li-ordered">$1</li>');

  text = text.replace(/(<li class="md-li">.*<\/li>)/s, '<ul class="md-ul">$1</ul>');
  text = text.replace(/(<li class="md-li-ordered">.*<\/li>)/s, '<ol class="md-ol">$1</ol>');

  text = text.replace(/^> (.*$)/gim, '<blockquote class="md-blockquote">$1</blockquote>');

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>');

  const codeBlocks = [];
  text = text.replace(/<div class="code-block">[\s\S]*?<\/div>/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  text = text.replace(/\n/g, '<br>');

  codeBlocks.forEach((block, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return text;
}

// getHTML(): 在 Worker 里把 Base64 解码回 HTML
function getHTML() {
  try {
    // Cloudflare Worker 支持 atob
    const html = atob(HTML_BASE64);
    return html;
  } catch (e) {
    console.error('解码 HTML 失败:', e);
    return `<!doctype html><html><head><meta charset="utf-8"><title>错误</title></head><body><h1>页面加载失败</h1><p>解码 HTML 失败。</p></body></html>`;
  }
}
