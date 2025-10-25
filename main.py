import customtkinter as ctk

class Section(ctk.CTkFrame):

    def __init__(self, master, width = 200, height = 200, corner_radius = None, border_width = None, bg_color = "transparent", fg_color = None, border_color = None, background_corner_colors = None, overwrite_preferred_drawing_method = None, **kwargs):
        super().__init__(master, width, height, corner_radius, border_width, bg_color, fg_color, border_color, background_corner_colors, overwrite_preferred_drawing_method, **kwargs)
        self.configure(True, bg_color="transparent", fg_color="transparent")
        
        self.configure(True,border_width=1) # For Debug
        pass

    pass

class Schedule(ctk.CTkFrame):

    def __init__(self, master, width = 200, height = 200, corner_radius = None, border_width = None, bg_color = "transparent", fg_color = None, border_color = None, background_corner_colors = None, overwrite_preferred_drawing_method = None, **kwargs):
        super().__init__(master, width, height, corner_radius, border_width, bg_color, fg_color, border_color, background_corner_colors, overwrite_preferred_drawing_method, **kwargs)
        self.configure(True, bg_color="transparent", fg_color="transparent", border_width=1, corner_radius=0)

        days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

        # self.columnconfigure(0, weight=2)
        # self.rowconfigure(0, weight=2)

        rows = 15
        columns = 8
        for r in range(rows):
            for c in range(columns):
                if r == 0 and c == 0:
                    continue


                if r == 0:
                    label = ctk.CTkLabel(self, text=days[c-1], width=64)
                    label.grid(row=r, column=c, padx=16, pady=4)
                else:
                    if c == 0:
                        hour = (8 + (r-1))
                        
                        time = "%2d:00 " % (hour % 12)
                        if hour >= 12:
                            time += "PM"
                        else:
                            time += "AM"
                        label = ctk.CTkLabel(self, text=time)
                        label.grid(row=r, column=c, padx=16, pady=4)
                    else:
                        rect = ctk.CTkFrame(self, border_width=1, fg_color="transparent", width=40, height=20, corner_radius=0)
                        rect.grid(row=r, column=c, sticky="nsew")
                        
        pass



    pass

class App(ctk.CTk):
    
    def __init__(self, title = "", geometry = "", fg_color = None, **kwargs):
        super().__init__(fg_color, **kwargs)
        
        if title:
            self.wm_title(title)
        
        if geometry:
            self.geometry(geometry)

        self.columnconfigure(0, weight=1)
        self.columnconfigure(1, weight=3)
        self.rowconfigure(0, weight=1)

        self.MainUI()
        
        self.mainloop()
        pass
    
    def MainUI(self):

        courses_section = Section(self)
        courses_section.grid(row=0, column=0, stick="nsew")


        schedule_section = Section(self)
        schedule_section.grid(row=0, column=1, stick="nsew")

        schedule = Schedule(schedule_section)
        schedule.pack(anchor=ctk.CENTER)

        pass
    
    pass


root = App(title="Schedule Planner UPM", geometry="1280x720")