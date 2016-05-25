package main

import (
	"encoding/json"
	"net/http"
)

func init() {
	http.HandleFunc("/", httpDragonServer)
}

type Action struct {
	Name string
	ID   string
}

type State struct {
	Gold    int
	Size    int
	Other   map[string]interface{}
	Actions []Action
}

func httpDragonServer(w http.ResponseWriter, r *http.Request) {
	// TODO: load profile

	s := State{
		Gold:  100,
		Size:  50,
		Other: make(map[string]interface{}),
		Actions: []Action{
			{Name: "Feed dragon", ID: "feed"},
			{Name: "Pillage villages", ID: "pillage"},
			{Name: "Sleep", ID: "sleep"},
		},
	}

	switch r.Method {
	case "GET":
		// do nothing
	case "POST":
		action := r.FormValue("action")

		switch action {
		case "feed":
		case "pillage":
		case "sleep":
		default:
			http.Error(w, "", http.StatusBadRequest)
			return
		}
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(&s)
}
