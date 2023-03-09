function create_files() {
  let world = new file({ name:TEXT("world"), level:100 });
  let system = new file({ name:TEXT("solar system"), folder:world, level:1 });
  let star = new file({ name:TEXT("star"), folder:system });
  new file({ name:TEXT("star"), folder:system });
  new file({ name:TEXT("star"), folder:system });

  new machine({ name:TEXT("doda's seeing eye"), folder:star });
  let city = new file({ name:TEXT("city"), folder:star });
  let ship = new placemachine({ name:TEXT("ship"), folder:star });
  let you = new person({ name:"doda", folder:ship, image:"guy3.png" });
  let peep = new person({ name:"peep", folder:ship, image:"guy1.png" });

  let freezer = new file({ name:TEXT("freezer"), folder:ship });

  let pizza_box = new file({ name:TEXT("pizza box"), folder:freezer });
  new image({ name:TEXT("pepperoni pizza slice"), folder:pizza_box, image:"pizza.png" });
  new image({ name:TEXT("pepperoni pizza slice"), folder:pizza_box, image:"pizza.png" });
  new image({ name:TEXT("pepperoni pizza slice"), folder:pizza_box, image:"pizza.png" });

  let small_pizza_box = new file({ name:TEXT("tiny pizza box"), folder:pizza_box });
  new image({ name:TEXT("pepperoni pizza slice"), folder:small_pizza_box, image:"pizza.png" });

  star.open(null, null, true);
}