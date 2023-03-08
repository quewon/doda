function create_files() {
  let world = new file({ name:"world", level:100 });
  let system = new file({ name:"solar system", folder:world, level:1 });
  let star = new file({ name:"star", folder:system });
  new file({ name:"star", folder:system });
  new file({ name:"star", folder:system });

  new machine({ name:"doda's seeing eye", folder:star });
  let city = new file({ name:"city", folder:star });
  let ship = new file({ name:"ship", folder:star });
  let you = new person({ name:"doda", folder:ship });
  let peep = new person({ name:"peep", folder:ship });

  let freezer = new file({ name:"freezer", folder:ship });

  let pizza_box = new file({ name:"pizza box", folder:freezer });
  new image({ name:"pepperoni pizza slice", folder:pizza_box, image:"pizza.png" });
  new image({ name:"pepperoni pizza slice", folder:pizza_box, image:"pizza.png" });
  new image({ name:"pepperoni pizza slice", folder:pizza_box, image:"pizza.png" });

  let small_pizza_box = new file({ name:"tiny pizza box", folder:pizza_box });
  new image({ name:"pepperoni pizza slice", folder:small_pizza_box, image:"pizza.png" });

  star.open(null, true);
}