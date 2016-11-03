package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.joda.time.DateTime;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.database.BilletDao;
import mil.dds.anet.views.ObjectListView;

@Path("/billets")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class BilletResource {

	BilletDao dao;
	AnetObjectEngine engine;
	
	public BilletResource(AnetObjectEngine engine) { 
		this.dao = engine.getBilletDao();
		this.engine = engine;
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<Billet> getAllBilletsView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new ObjectListView<Billet>(dao.getAllBillets(pageNum, pageSize), Billet.class);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Billet getBillet(@PathParam("id") int id) {
		Billet b = dao.getById(id);
		return b.render("show.ftl");
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Billet getBilletForm() { 
		Billet b = (new Billet());
		b.addToContext("aos", engine.getAdvisorOrganizationDao().getAll(0, Integer.MAX_VALUE));
		return b.render("form.ftl");
	}
	
	@POST
	@Path("/new")
	public Billet createBillet(Billet b) {
		return dao.insert(b);
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Billet getBilletEditForm(@PathParam("id") int id) { 
		Billet b = dao.getById(id);
		b.addToContext("aos", engine.getAdvisorOrganizationDao().getAll(0, Integer.MAX_VALUE));
		return b.render("form.ftl");
	}
	
	@POST
	@Path("/update")
	public Response updateBillet(Billet b) { 
		int numRows = dao.update(b);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@GET
	@Path("/{id}/advisor")
	public Person getAdvisorInBillet(@PathParam("id") int billetId, @QueryParam("atTime") Long atTimeMillis) {
		Billet b = new Billet();
		b.setId(billetId);
		
		DateTime dtg = (atTimeMillis == null) ? DateTime.now() : new DateTime(atTimeMillis);
		return dao.getPersonInBillet(b, dtg);
	}
	
	@POST
	@Path("/{id}/advisor")
	public Response putAdvisorInBillet(@PathParam("id") int billetId, Person p) {
		Billet b = new Billet();
		b.setId(billetId);
		dao.setPersonInBillet(p, b);
		return Response.ok().build();
	}
	
	@DELETE
	@Path("/{id}/advisor")
	public Response deleteAdvisorFromBillet(@PathParam("id") int id) { 
		dao.removePersonFromBillet(Billet.createWithId(id));
		return Response.ok().build();
	}
	
	@GET
	@Path("/{id}/tashkils")
	public List<Tashkil> getAssociatedTashkils(@PathParam("id") int billetId) { 
		Billet b = Billet.createWithId(billetId);
		
		return dao.getAssociatedTashkils(b);
	}
	
	@POST
	@Path("/{id}/tashkils")
	public Response associateTashkil(@PathParam("id") int billetId, Tashkil t) { 
		Billet b = Billet.createWithId(billetId);
		dao.associateTashkil(b, t);
		return Response.ok().build();
	}
	
	@DELETE
	@Path("/{id}/tashkils/{tashkilId}")
	public Response deleteTashkilAssociation(@PathParam("id") int billetId, @PathParam("tashkilId") int tashkilId) { 
		Billet b = Billet.createWithId(billetId);
		Tashkil t = Tashkil.createWithId(tashkilId);
		dao.deleteTashkilAssociation(b, t);
		return Response.ok().build();
	}
	
	@GET
	@Path("/empty")
	public List<Billet> getEmptyBillets() { 
		return dao.getEmptyBillets();
	}
}
