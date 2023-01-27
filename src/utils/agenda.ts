import Agenda from "agenda";
import _default from "../config/default";

export const agenda = new Agenda({
  db: { address: _default.dbUri, collection: "agendaJobs" },
});
